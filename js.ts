const newLogin = $("#newLogin")
if (newLogin) {

    $('[data-target]').on("click", (e) => {
        const el = $(e.currentTarget)
        // activate self
        const group = el.attr("data-group")
        $(`[data-group="${group}"]`).removeClass("active");
        el.addClass("active")
        //activate target
        const target = el.attr("data-target") || "";
        const targetGroup = $(target).attr("data-group") || "";
        $(`[data-group="${targetGroup}"]`).removeClass("active");
        $(target).addClass("active");
    })
}