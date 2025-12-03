import axios from "axios"

const newLogin = $("#newLogin")
// if (newLogin) {

    const activateSection = ($section) => {
        const targetGroup = $section.attr("data-group") || "";
        $(`[data-group="${targetGroup}"]`).removeClass("active");
        $section.addClass("active");
    }
    function formToJSON(form) {
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
    const otp = $("#otp")
    const resend = otp.find("#resend")
    const timer = otp.find("#timer")

    resend.on("click", () => {
        resend.removeClass("active")
        timer.addClass("active")
        startTimer()
    })

    let timerInterval;
    const startTimer = () => {
        const span = timer.find("span")
        let seconds = 60;
        span.text(seconds)
        clearInterval(timerInterval)
        timerInterval = setInterval(() => {
            seconds--
            span.text(seconds)
            if (seconds === 0) {
                clearInterval(timerInterval)
                resend.addClass("active")
                timer.removeClass("active")
            }
        }, 1000);
    }
    
    const activateOtpSection = (number: string) => {
        otp.find("#numberPlaceholder").text(number)
        otp.one("transitionend", () => {
            otp.find("input").eq(0).trigger("focus")
            startTimer()
        })
        activateSection(otp)
    }

    $('[data-target]').on("click", (e) => {
        const el = $(e.currentTarget)
        // activate self
        const group = el.attr("data-group")
        $(`[data-group="${group}"]`).removeClass("active");
        el.addClass("active")
        //activate target
        const target = el.attr("data-target") || "";
        activateSection($(target))
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
    const showInputError = (msg: string, $input) => {
        if ($input.next().hasClass("validation-error")) {
            $input.addClass("hasError")
            $input.next().text(msg).addClass("show")
        }
    }
    const showGeneralError = (msg: string, $form) => {
        $form.find(".validation-error.general").text(msg).addClass("show")
    }
    const clearGeneralError = ($form) => {
        $form.find(".validation-error.general").removeClass("show")
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
                    showInputError(error, ele)
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
                    showInputError(error, ele)
                    noErrors = false
                    break
                }
            }
        })
        return noErrors
    }
    const dummyFetch = async () => {
        const rand = Math.random()
        return await new Promise((res, rej) => {
            setTimeout(() => {
                if (rand > .5) res("")
                    else rej("خطا در برقراری ارتباط با شبکه. لطفا مجددا تلاش کنید.")
            }, 1000);
        })
    }

    //otp input
    const inputs = $(".otpInput").find("input");
    inputs.each((idx, el) => {
        $(el).on("input", () => {
            const maybeNext = inputs[idx+1];
            if (maybeNext) maybeNext.focus()
                else 
            $(el).closest("form").trigger("submit")
        })
        $(el).on("focus", el => {
            $(el.target).val("")
        })
        $(el).on("keydown", e => {
            if (e.key === "Backspace") {
                const maybePrev = inputs[idx - 1]
                if (maybePrev) {
                    maybePrev.focus()
                    $(el).val("")
                }
            }
        })
    })
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

    const otpForm = $("#login-otp")
    otpForm.on("submit", async function(e) {
        e.preventDefault()
        clearGeneralError(otpForm)
        if (!validateForm(otpForm)) return
        setFormLoading(otpForm, true)
        const data = formToJSON(otpForm[0])

        dummyFetch()
        .then(() => {
            activateOtpSection(data.Phone as string)
        })
        .catch((err) => {
            showGeneralError(err, otpForm)
        })
        .finally(() => {
            setFormLoading(otpForm, false)
        })
    })
// }