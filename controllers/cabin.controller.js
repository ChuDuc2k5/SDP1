import cabinDao from "../dao/cabin.dao.js";
import imageDao from "../dao/image.dao.js";
import rateDao from "../dao/rate.dao.js";
import { Cabin } from "../models/cabin.model.js";
import { CabinSortFactory } from "../patterns/factory/cabin/factoryPattern.js";

const CABINS_PER_PAGE = 9;

const parsePage = (value) => {
  const page = Number(value);
  return Number.isInteger(page) && page > 0 ? page : 1;
};

const buildBaseQuery = (query = {}) => {
  return Object.entries(query).reduce((baseQuery, [key, value]) => {
    if (key !== "page") {
      baseQuery[key] = value;
    }
    return baseQuery;
  }, {});
};

const buildCabinPageUrl = (baseQuery, page) => {
  const params = new URLSearchParams();

  Object.entries(baseQuery).forEach(([key, value]) => {
    if (key === "page" || value === undefined || value === null || value === "") {
      return;
    }

    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item !== undefined && item !== null && item !== "") {
          params.append(key, String(item));
        }
      });
      return;
    }

    if (typeof value !== "object") {
      params.set(key, String(value));
    }
  });

  params.set("page", String(page));
  return `/cabins?${params.toString()}`;
};

export const buildPaginationItems = (
  currentPage,
  totalPages,
  baseQuery = {},
) => {
  const items = [];

  const addPage = (page) => {
    items.push({
      type: "page",
      value: page,
      isActive: page === currentPage,
      url: buildCabinPageUrl(baseQuery, page),
    });
  };

  const addEllipsis = () => {
    if (items[items.length - 1]?.type !== "ellipsis") {
      items.push({ type: "ellipsis" });
    }
  };

  if (totalPages <= 7) {
    for (let page = 1; page <= totalPages; page += 1) {
      addPage(page);
    }
    return items;
  }

  addPage(1);

  let start = Math.max(2, currentPage - 2);
  let end = Math.min(totalPages - 1, currentPage + 2);

  if (currentPage <= 2) {
    start = 2;
    end = 3;
  } else if (currentPage >= totalPages - 1) {
    start = totalPages - 2;
    end = totalPages - 1;
  }

  if (start > 2) {
    addEllipsis();
  }

  for (let page = start; page <= end; page += 1) {
    addPage(page);
  }

  if (end < totalPages - 1) {
    addEllipsis();
  }

  addPage(totalPages);
  return items;
};

const buildPagination = ({ baseQuery, currentPage, totalPages }) => {
  const hasPrevPage = currentPage > 1;
  const hasNextPage = currentPage < totalPages;
  const prevPage = hasPrevPage ? currentPage - 1 : 1;
  const nextPage = hasNextPage ? currentPage + 1 : totalPages;

  return {
    currentPage,
    totalPages,
    hasPrevPage,
    hasNextPage,
    prevPage,
    nextPage,
    prevPageUrl: buildCabinPageUrl(baseQuery, prevPage),
    nextPageUrl: buildCabinPageUrl(baseQuery, nextPage),
    showPagination: totalPages > 1,
    paginationItems: buildPaginationItems(currentPage, totalPages, baseQuery),
  };
};

const toCabinView = (row) => new Cabin(row).toJSON();

const listCabinsPaginated = async ({ sortType = "default", limit, offset }) => {
  const strategy = CabinSortFactory.getStrategy(sortType);
  const cabins = await strategy.apply(cabinDao.findPaginated({ limit, offset }));
  return cabins.map(toCabinView);
};

const countCabins = async () => {
  const result = await cabinDao.countAll();
  return Number(result?.total || 0);
};

const getCabinDetail = async (id) => {
  const cabin = await cabinDao.findById(id);
  if (!cabin) return null;

  const [rates, images] = await Promise.all([
    rateDao.findByCabinId(id),
    imageDao.findByCabinId(id),
  ]);
  const totalRating = rates.reduce((sum, item) => sum + Number(item.rating || 0), 0);

  return {
    cabin: toCabinView(cabin),
    rates,
    images,
    avgRating: rates.length ? (totalRating / rates.length).toFixed(1) : null,
    hasRates: rates.length > 0,
  };
};

export const listPublicCabins = async (req, res) => {
  try {
    const sortType = typeof req.query.sort === "string" ? req.query.sort : "default";
    const requestedPage = parsePage(req.query.page);
    const totalCabins = await countCabins();
    const totalPages = Math.max(Math.ceil(totalCabins / CABINS_PER_PAGE), 1);
    const currentPage = Math.min(requestedPage, totalPages);
    const offset = (currentPage - 1) * CABINS_PER_PAGE;
    const baseQuery = buildBaseQuery(req.query);
    const cabins = await listCabinsPaginated({
      sortType,
      limit: CABINS_PER_PAGE,
      offset,
    });
    const pagination = buildPagination({
      baseQuery,
      currentPage,
      totalPages,
    });

    res.render("vwCabins/index", {
      cabins,
      empty: cabins.length === 0,
      activeSort: sortType,
      ...pagination,
    });
  } catch (error) {
    console.error("Failed to list cabins:", error.message);
    res.status(500).send("Internal Server Error");
  }
};

export const showCabinDetail = async (req, res) => {
  try {
    const detail = await getCabinDetail(req.params.id);
    if (!detail) return res.redirect("/cabins");

    res.render("vwCabins/detail", detail);
  } catch (error) {
    console.error("Failed to load cabin detail:", error.message);
    res.status(500).send("Internal Server Error");
  }
};
