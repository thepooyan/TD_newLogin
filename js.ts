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
        if (value) {
            btn.addClass("loading")
            btn.attr("disabled", "")
        } else {
            btn.removeClass("loading")
            btn.removeAttr("disabled")
        }
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

    // validation
    const validationRules: Record<string, {func: (val: string)=> boolean, msg: string} | undefined> = {
        req: {
            func: (val:string) => val.length > 0,
            msg: "لطفا فیلد را خالی نگذارید"
        },
        mobile: {
            func: (val: string) => /^\d{11}$/.test(val),
            msg: "شماره موبایل صحیح نمیباشد"
        }
    }
    const validate = (input:string, rule:string) => {
        const validator = validationRules[rule]
        if (!validator) throw new Error(`can't find validator for ${rule}`)
        if (!validator.func(input)) return validator.msg
        return null
    }
    const showError = (msg: string, $input) => {
        if ($input.next().hasClass("validation-error")) {
            $input.addClass("hasError")
            $input.next().text(msg).addClass("show")
        }
    }
    const clearError = ($input) => {
        if ($input.next().hasClass("validation-error")) {
            $input.removeClass("hasError")
            $input.next().removeClass("show")
        }
    }
    $("[data-val]").each((_, el) => {
        const ele = $(el)
        const validationItems = ele.attr("data-val")?.split(",") || []

        if (!validationItems.length) return

        $("<span><span/>").addClass("validation-error").insertAfter(ele)

        ele.on("input", (e) => {
            let noErrors = true;
            for (const vi of validationItems) {
                const error = validate(ele.val() as string, vi)
                if (error) {
                    showError(error, ele)
                    noErrors = false;
                    break
                }
            }
            if (noErrors) {
                clearError(ele)
            }
        })
    })

    // submit handlers
    const optForm = $("#login-otp")
    optForm.on("submit", async e => {
        e.preventDefault()
        const data = formToJSON(e.target as HTMLFormElement)
        const url = e.target.dataset.submitto;
        let errors = optForm.find("input.hasError")
        if (errors.length !== 0) return
        if (!url) return
        setFormLoading(e.currentTarget, true)

        let res = await axios.post(url, data).catch(() => {
            alert("error")
            return null
        })
        setFormLoading(e.currentTarget, false)
        if (!res) return
        alert("success")
    })


// }