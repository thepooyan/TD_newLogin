const newLogin = $("#newLogin")
if (newLogin) {

    $('[data-target]').on("click", (e) => {
        // activate self
        $('[data-target]').removeClass("active")
        $(e.currentTarget).addClass("active")
        //activate target
        const target = $(e.currentTarget).attr("data-target") || "";
        const group = $(target).attr("data-group") || "";
        console.log(group)
        $(`[data-group="${group}"]`).removeClass("active");
        $(target).addClass("active");
    })
}