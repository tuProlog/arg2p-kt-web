import { monaco } from '../editor.mjs';
import { FLAG_GROUPS, FLAGS, readFlags, setValue, setValues, setSwitch, warningsOf } from './flagsSchema.mjs';

const DEFAULT_FLAGS = [
    'graphBuildMode(standard_af).',
    'statementLabellingMode(statement).',
    'argumentLabellingMode(grounded).',
    'orderingPrinciple(last).',
    'orderingComparator(elitist).',
    'graphExtension(standardPref).',
    'queryMode.',
].join('\n')

const NOT_SET = "";

// The flags tab: the flags as Prolog text (what the solver is given, and what
// links share), and a form with every documented flag. Either can be edited:
// the form rewrites only the lines of the flag changed, and follows the text.
function FlagsModule() {

    var editor;
    let form;
    let warningBox;
    const listeners = [];

    function init(container, initialFlags, formContainer, warnings, semanticsOptions) {
        prepareContainer(container, initialFlags)
        form = formContainer
        warningBox = warnings
        buildForm(semanticsOptions)
        editor.onDidChangeModelContent(() => {
            refreshForm()
            listeners.forEach(listener => listener())
        })
        refreshForm()
        return { flags, setFlag, flagValue, onChange, setFlags, editor: () => editor }
    }

    function prepareContainer(container, initialFlags) {
        editor = monaco.editor.create(container, {
            value: initialFlags !== undefined && initialFlags !== null ? initialFlags : DEFAULT_FLAGS,
            language: 'tuprolog',
            scrollbar: {
                vertical: 'auto',
                horizontal: 'hidden'
            },
            minimap: {
                enabled: false
            },
            overviewRulerBorder: false,
            overviewRulerLanes: 0,
            hideCursorInOverviewRuler: true,
            automaticLayout: true
        });

    }

    function flags() {
        return editor.getValue()
    }

    function flagValue(name) {
        return readFlags(flags())[name] ?? null
    }

    // Rewrites `name(...)` in place, appending the flag when it is not there yet,
    // so that the flags text stays the single source of truth.
    function setFlag(name, value) {
        update(text => setValue(text, name, value))
    }

    // Replaces all the flags (another document of the working memory).
    function setFlags(text) {
        if (text !== flags()) editor.setValue(text)
    }

    function onChange(listener) {
        listeners.push(listener)
    }

    function update(change) {
        const current = flags()
        const next = change(current)
        if (next !== current) editor.setValue(next)
    }

    // --- the form -----------------------------------------------------------

    function buildForm(semanticsOptions) {
        form.replaceChildren(...FLAG_GROUPS.map(group => {
            const fieldset = element("fieldset", "flags-group")
            fieldset.appendChild(element("legend", null, group.title))
            group.flags.forEach(flag => fieldset.appendChild(control(flag, semanticsOptions)))
            return fieldset
        }))
    }

    function control(flag, semanticsOptions) {
        const box = element("div", `flag flag-${flag.kind}`)
        box.dataset.flag = flag.name
        if (flag.kind === "switch") {
            const label = element("label", "flag-check")
            const input = element("input")
            input.type = "checkbox"
            input.addEventListener("change", () => update(text => setSwitch(text, flag.name, input.checked)))
            label.append(input, element("span", "flag-label", flag.label))
            box.append(label, element("small", "flag-help", flag.help))
            return box
        }
        const id = `flag-${flag.name}`
        const label = element("label", "flag-label", flag.label)
        label.htmlFor = id
        box.appendChild(label)
        if (flag.kind === "choice") {
            const select = element("select", "custom-select custom-select-sm")
            select.id = id
            if (flag.options === "semantics") select.innerHTML = semanticsOptions
            else flag.options.forEach(([value, text, help]) => {
                const option = new Option(text, value)
                option.title = help
                select.add(option)
            })
            select.addEventListener("change", () => update(text => setValue(text, flag.name, select.value)))
            box.append(select, element("small", "flag-help", flag.help), element("small", "flag-option-help"))
        } else if (flag.kind === "set") {
            const list = element("div", "flag-set")
            flag.options.forEach(([value, text, help]) => {
                const option = element("label", "flag-check")
                const input = element("input")
                input.type = "checkbox"
                input.value = value
                input.addEventListener("change", () => update(current => setValues(current, flag.name,
                    [...list.querySelectorAll("input")].filter(it => it.checked).map(it => it.value)
                        // values the form does not know stay as they are
                        .concat(readFlags(current)[flag.name].filter(it => !flag.options.some(([known]) => known === it))))))
                const caption = element("span", "flag-option")
                caption.append(element("span", "flag-label", text), element("small", "flag-help", help))
                option.append(input, caption)
                list.appendChild(option)
            })
            box.append(list, element("small", "flag-help", flag.help))
        } else {
            const input = element("input", "form-control form-control-sm")
            input.id = id
            input.type = "text"
            input.placeholder = flag.placeholder
            input.addEventListener("change", () => update(text => setValue(text, flag.name, input.value)))
            box.append(input, element("small", "flag-help", flag.help))
        }
        return box
    }

    // Puts the form in step with the text.
    function refreshForm() {
        const state = readFlags(flags())
        FLAGS.forEach(flag => {
            const box = form.querySelector(`[data-flag="${flag.name}"]`)
            const value = state[flag.name]
            if (flag.kind === "switch") box.querySelector("input").checked = value
            else if (flag.kind === "set") box.querySelectorAll("input").forEach(it => { it.checked = value.includes(it.value) })
            else if (flag.kind === "text") {
                const input = box.querySelector("input")
                if (document.activeElement !== input) input.value = value ?? ""
            } else showChoice(box.querySelector("select"), value, flag)
        })
        const warnings = warningsOf(state)
        warningBox.hidden = warnings.length === 0
        warningBox.replaceChildren(...warnings.map(text => element("div", null, text)))
    }

    // A value the list does not offer (or no value) is shown as such, rather
    // than silently as another one.
    function showChoice(select, value, flag) {
        select.querySelectorAll("option.flag-extra").forEach(it => it.remove())
        const wanted = value === null ? NOT_SET : value
        if (![...select.options].some(it => it.value === wanted)) {
            const extra = new Option(value === null ? "— not set —" : value, wanted)
            extra.className = "flag-extra"
            select.add(extra, 0)
        }
        select.value = wanted
        select.classList.toggle("is-invalid", value === null)
        const chosen = select.selectedOptions[0]
        select.parentElement.querySelector(".flag-option-help").innerText =
            chosen && chosen.title ? chosen.title : ""
    }

    function element(tag, className, text) {
        const node = document.createElement(tag)
        if (className) node.className = className
        if (text !== undefined) node.innerText = text
        return node
    }

    return { init }
}

export { DEFAULT_FLAGS }
export default FlagsModule()
