import {
  countCabins,
  getCabinDetail,
  listCabinsPaginated,
} from "../services/cabin.service.js";

const CABINS_PER_PAGE = 9;

const parsePage = (value) => {
  const page = Number(value);
  return Number.isInteger(page) && page > 0 ? page : 1;
};

const buildCabinPageUrl = (query, page) => {
  const params = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
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

const buildPagination = ({ query, currentPage, totalPages }) => {
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
    prevPageUrl: buildCabinPageUrl(query, prevPage),
    nextPageUrl: buildCabinPageUrl(query, nextPage),
    showPagination: totalPages > 1,
    pages: Array.from({ length: totalPages }, (_, index) => {
      const page = index + 1;
      return {
        number: page,
        url: buildCabinPageUrl(query, page),
        isActive: page === currentPage,
      };
    }),
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
    const cabins = await listCabinsPaginated({
      sortType,
      limit: CABINS_PER_PAGE,
      offset,
    });
    const pagination = buildPagination({
      query: req.query,
      currentPage,
      totalPages,
    });

    res.render("vwCabins/index", {
      cabins,
      empty: cabins.length === 0,
      activeSort: sortType,
      pagination,
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
