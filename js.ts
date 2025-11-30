import axios from "axios"

const newLogin = $("#newLogin")
// if (newLogin) {

    const activateSection = (sectionId: string) => {
        const target = $(sectionId)
        const targetGroup = target.attr("data-group") || "";
        $(`[data-group="${targetGroup}"]`).removeClass("active");
        target.addClass("active");
    }
    function formToJSON(form: HTMLFormElement) {
        const data = new FormData(form)
        return Object.fromEntries(data.entries())
    }
    const setFormLoading = (form, value: boolean) => {
        const btn = $(form).find("button")
        if (value)
            btn.addClass("loading")
        else
            btn.removeClass("loading")
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

    $("#login-otp").on("submit", async e => {
        e.preventDefault()
        setFormLoading(e.currentTarget, true)
        const data = formToJSON(e.target as HTMLFormElement)
        const url = e.target.dataset.submitto;
        if (!url) return

        let res = await axios.post(url, data).catch(() => {
            alert("error")
            return null
        })
        setFormLoading(e.currentTarget, false)
        if (!res) return
        alert("success")
    })

// }