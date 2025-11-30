const newLogin = $("#newLogin")
// if (newLogin) {

    const activateSection = (sectionId: string) => {
        const target = $(sectionId)
        const targetGroup = target.attr("data-group") || "";
        $(`[data-group="${targetGroup}"]`).removeClass("active");
        target.addClass("active");
    }

    $('[data-target]').on("click", (e) => {
        const el = $(e.currentTarget)
        // activate self
        const group = el.attr("data-group")
        $(`[data-group="${group}"]`).removeClass("active");
        el.addClass("active")
        //activate target
        const target = el.attr("data-target") || "";
        activateSection(target)
    })
// }