import axios from "axios"

const newLogin = $("#newLogin")
// if (newLogin) {

    type success<T> = [T, null]
    type fail = [null, Error]
    const safe = async <T>(pr: () => Promise<T>):Promise<success<T> | fail> => {
        try {
            debugger
            let res = await pr()
            return [res, null] as success<T>
        }catch(e) {
            return [null, e] as fail
        }
    }
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
        const data = formToJSON(e.target as HTMLFormElement)
        const url = e.target.dataset.submitto;
        if (!url) return

        let res = await axios.post(url, data).catch(() => {
            alert("error")
            return null
        })
        if (!res) return
        alert("success")
    })
// }