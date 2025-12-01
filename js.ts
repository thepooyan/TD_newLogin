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
        },
        pass: {
            func: (val: string) => $("#password").val() === val,
            msg: "تکرار رمز عبور اشتباه میباشد"
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

        $(ele)
            .wrap('<div></div>')
            .after($('<span></span>').addClass('validation-error'))

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

    const validateForm = ($form) => {
        let noErrors = true
        $form.find("[data-val]").each((_, el) => {
            const ele = $(el)
            const validationItems = ele.attr("data-val")?.split(",") || []
            if (!validationItems.length) return
            for (const vi of validationItems) {
                const error = validate(ele.val() as string, vi)
                if (error) {
                    showError(error, ele)
                    noErrors = false
                    break
                }
            }
        })
        return noErrors
    }

    // submit handlers
    $("  #signup, #login-pass").on("submit", async function(e) {
        e.preventDefault()
        const el = $(e.target)
        const data = formToJSON(e.target as HTMLFormElement)
        const url = e.target.dataset.submitto;
        const ok = validateForm(el)
        if (!ok || !url) return
        setFormLoading(e.currentTarget, true)

        let res = await axios.post(url, data).catch(() => {
            alert("error")
            return null
        })
        setFormLoading(e.currentTarget, false)
        if (!res) return
        alert("success")
    })

    $("#login-otp").on("submit", async function(e) {
        e.preventDefault()
        activateSection("#otp")
        
    })
// }