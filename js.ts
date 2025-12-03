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
    const otpForm = $("#otp")
    const resend = otpForm.find("#resend")
    const timer = otpForm.find("#timer")

    resend.on("click", () => {
        resend.removeClass("active")
        timer.addClass("active")
        startTimer()
    })

    let timerInterval;
    const startTimer = () => {
        timer.addClass("active")
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

    const disableTimer = () => {
        timer.removeClass("active")
        resend.removeClass("active")
    }
    
    const activateOtpSection = (number: string, back: string, hasResend: boolean) => {
        otpForm.attr("data-number", number)
        otpForm.find("#numberPlaceholder").text(number)
        otpForm.find("#backBtn").attr("data-target", back)
        otpForm.find("input").val("")
        clearGeneralError(otpForm)
        !hasResend && disableTimer()
        otpForm.one("transitionend", () => {
            otpForm.find("input").eq(0).trigger("focus")
            hasResend && startTimer()
        })
        activateSection(otpForm)
    }

    $(document).on("click", "[data-target]", e => {
        const el = $(e.currentTarget)
        // activate self
        activateSection(el)
        //activate target
        activateSection($(el.attr("data-target") || ""))
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
        $input.addClass("hasError")
        if ($input.next().hasClass("validation-error")) {
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

        if (!$(ele).hasClass("noError"))
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
    let fetchFlip = false;
    const dummyFetch = async (url: string, data: any, params?: any) => {
        console.log(`Request: ${url} data: ${JSON.stringify(data)} params: ${JSON.stringify(params)}`)
        return await new Promise((res, rej) => {
            setTimeout(() => {
                fetchFlip = !fetchFlip
                if (fetchFlip) res("")
                    else rej("خطا در برقراری ارتباط با شبکه. لطفا مجددا تلاش کنید.")
            }, 1000);
        })
    }
    dummyFetch.post = dummyFetch
    const getOtpValue = () => {
        let val = ""
        otpForm.find("input").each((_,e) => {val += e.value} )
        return val
    }

    //otp input
    const inputs = $(".otpInput").find("input");
    inputs.each((idx, el) => {
        $(el).on("input", () => {
            const maybeNext = inputs[idx+1];
            if (maybeNext) maybeNext.focus()
            else {
                $(el).trigger("blur")
                $(el).closest("form").trigger("submit")
            }
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
    $("#signup, #login-pass").on("submit", async function(e) {
        e.preventDefault()
        const el = $(e.target)
        const data = formToJSON(e.target as HTMLFormElement)
        const url = e.target.dataset.submitto;
        const ok = validateForm(el)
        if (!ok || !url) return
        setFormLoading(e.currentTarget, true)

        dummyFetch.post(url, data)
        .then(() => {
            alert("success")
        })
        .catch((err) => {
            showGeneralError(err, el)
        })
        .finally(() => {
            setFormLoading(e.currentTarget, false)
        })
    })

    const loginByCodeForm = $("#login-otp")
    loginByCodeForm.on("submit", async function(e) {
        e.preventDefault()
        clearGeneralError(loginByCodeForm)
        if (!validateForm(loginByCodeForm)) return
        setFormLoading(loginByCodeForm, true)
        const data = formToJSON(loginByCodeForm[0])

        dummyFetch.post("/LoginByCode", data)
        .then(() => {
            activateOtpSection(data.Phone as string, "#login", true)
        })
        .catch((err) => {
            showGeneralError(err, loginByCodeForm)
        })
        .finally(() => {
            setFormLoading(loginByCodeForm, false)
        })
    })

    const forgotForm = $("#forgetPassword")
    forgotForm.on("submit", async function(e) {
        e.preventDefault()
        clearGeneralError(forgotForm)
        if (!validateForm(forgotForm)) return
        setFormLoading(forgotForm, true)
        const data = formToJSON(forgotForm[0])

        dummyFetch.post("/ForgotPassword", data)
        .then(() => {
            activateOtpSection(data.Mobile as string, "#forgetPassword", false)
        })
        .catch((err) => {
            showGeneralError(err, forgotForm)
        })
        .finally(() => {
            setFormLoading(forgotForm, false)
        })
    })

    $(document).on("submit", "#otp", function(e) {
        e.preventDefault()
        clearGeneralError(otpForm)
        const val = getOtpValue()
        const mobile = otpForm.attr("data-number")
        if (val.length < 5) {
            return showGeneralError("لطفا کد را کامل وارد کنید", otpForm)
        }
        const params = {
            Mobile: mobile,
            VerifyCode: val,
        }
        setFormLoading(otpForm, true)
        dummyFetch.post("/ConfirmVerify", null, params)
        .then(() => {
            alert("welcome!")
        })
        .catch(err => {
            showGeneralError(err, otpForm)
        })
        .finally(() => {
            setFormLoading(otpForm, false)
        })
    })
    
    
// }