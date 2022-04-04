import $ from "jquery";

export const handleSubmit = (e, callback) => {
    e.preventDefault();
    const form = $(e.target);
    $.ajax({
        type: "POST",
        url: form.attr("action"),
        data: form.serialize(),
        success(data) {
            callback(data);
        },
    });
};

