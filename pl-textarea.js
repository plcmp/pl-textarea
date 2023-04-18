import { PlElement, html, css } from "polylib";
import { debounce } from "@plcmp/utils";

import "@plcmp/pl-labeled-container";

class PlTextArea extends PlElement {
    static properties = {
        label: { type: String },
        orientation: { type: String },
        value: { type: String, value: '', observer: '_valueObserver' },
        title: { type: String, value: undefined },
        placeholder: { type: String, value: '' },
        required: { type: Boolean, observer: '_requiredObserver' },
        invalid: { type: Boolean },
        hidden: { type: Boolean, reflectToAttribute: true },
        readonly: { type: Boolean, observer: '_readonlyObserver' },
        disabled: { type: Boolean, reflectToAttribute: true, observer: '_disabledObserver' },
        fit: { type: Boolean, value: false, reflectToAttribute: true },
        stretch: { type: Boolean, value: false, reflectToAttribute: true },
        grow: { type: Boolean, value: false },
        hideResizer: { type: Boolean, value: false, reflectToAttribute: true }
    };

    static css = css`
        :host {
            display: flex;
            outline: none;
        }

        :host([hidden]) {
            display: none;
        }

        :host([stretch]) {
            --content-width: 100%;
            --textarea-content-width: 100%;
            width: 100%;
            flex-shrink: 1;
        }

        :host([fit])  {
            --content-width: 100%;
            --content-height: 100%;

            --textarea-content-width: 100%;
            --textarea-content-height: 100%;

            height: 100%;
            width: 100%;
            
            min-width: 0;
            max-width: 100%;
        }

        :host([hide-resizer]) textarea {
            resize: none;
        }

        :host([disabled]) .input-container,
        :host([disabled]) .input-container textarea,
        :host([disabled]) ::placeholder {
            color: var(--grey-darkest);
            background: var(--grey-lightest);
            cursor: not-allowed;
            user-select: none;
        }

        :host([:not(disabled)]:hover) .input-container {
            border: 1px solid var(--primary-dark);
        }

        :host([:not(disabled)]:active) .input-container {
            border: 1px solid var(--primary-base);
        }

        .input-container:focus-within{
            border: 1px solid var(--primary-base) !important;
        }

        :host([invalid]) .input-container{
            border: 1px solid var(--negative-base) !important;
        }

        textarea {
            outline:none;
            padding-block-start: var(--space-xs);
            padding-inline-end: var(--space-sm);
            padding-block-end: 0;
            padding-inline-start: var(--space-sm);
            width: var(--textarea-content-width, 200px);
            height: var(--textarea-content-height, 80px);
            box-sizing: border-box;
            border: none;
            min-height: 48px;
            min-width: var(--content-width);
            background: transparent;
            color: inherit;
            font: inherit;
        }

        .input-container {
            display: flex;
            flex-direction: row;
            box-sizing: border-box;
            overflow: hidden;
            position: relative;
            box-sizing: border-box;
            border: none;
            border-radius: var(--border-radius);
            width: 100%;
            height: 100%;
            border: 1px solid var(--grey-base);
            border-radius: 4px;
            background: var(--background-color);
            font: var(--text-font);
            color: var(--text-color);
        }

        .input-container::before {
            content: '';
            display: block;
            position: absolute;
            box-sizing: border-box;
            inset-block-start: 0;
            inset-inline-start: 0;
        }

        .input-container.required::before {
            border-block-start: calc(var(--space-md) / 2) solid var(--attention);
            border-inline-start: calc(var(--space-md) / 2)  solid var(--attention);
            border-inline-end: calc(var(--space-md) / 2) solid transparent;
            border-block-end: calc(var(--space-md) / 2) solid transparent;
        }

        ::placeholder {
            color: var(--grey-dark);
        }
    `;

    static template = html`
        <pl-labeled-container orientation="[[orientation]]" label="[[label]]">
            <slot name="label-prefix" slot="label-prefix"></slot>
            <div class="input-container" id="container">
                <textarea id="nativeTextArea" disabled$="[[_toBool(disabled)]]" readonly$="[[_toBool(readonly)]]" value="{{fixText(value)}}" placeholder="[[placeholder]]"
                    title="[[fixText(title)]]" tabindex$="[[_getTabIndex(disabled)]]" on-focus="[[_onFocus]]" on-input="[[_onInput]]"></textarea>
            </div>
            <slot name="label-suffix" slot="label-suffix"></slot>
        </pl-labeled-container>
    `;

    connectedCallback() {
        super.connectedCallback();
        this.validate();
    }
    
    _disabledObserver(){
        this.validate();
    }

    _requiredObserver() {
        this.validate();
    }

    _readonlyObserver() {
        this.validate();
    }

    fixText(t) {
        if (t === undefined || t === null) return '';
        return t;
    }

    _toBool(val) {
        return !!val;
    }

    _valueObserver(value) {
        this.validate();
    }

    _onInput() {
        let debouncer = debounce(() => {
            this.value = this.$.nativeTextArea.value;
        }, 100)

        debouncer();
    }

    validate() {
        if (this.required && (this.value == null || this.value === undefined || this.value == '') && !this.disabled && !this.readonly) {
            this.$.container.classList.add('required');
            this.invalid = true;
        }
        else {
            this.$.container.classList.remove('required');
            this.invalid = false;
        }
        this.dispatchEvent(new CustomEvent('validation-changed', { bubbles: true, composed: true }))
    }

    _onFocus(event) {
        var length = this.value?.toString().length || 0;
        this.$.nativeTextArea.setSelectionRange(length, length);
    }

    _getTabIndex(disabled) {
        return disabled ? -1 : 0;
    }
}

customElements.define('pl-textarea', PlTextArea);