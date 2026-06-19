document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".booking-date-input").forEach((input) => {
        const openDatePicker = () => {
            if (typeof input.showPicker === "function") {
                try {
                    input.showPicker();
                } catch (error) {
                    // Some browsers only allow showPicker during direct user gestures.
                }
            }
        };

        input.addEventListener("click", openDatePicker);
    });
});
