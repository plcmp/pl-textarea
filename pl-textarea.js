import { PlElement, html, css } from "polylib";
import { debounce } from "@plcmp/utils";

import "@plcmp/pl-labeled-container";

class PlTextArea extends PlElement {
    static  properties = {
        label: { type: String },
        variant: { type: String },
        orientation: { type: String },
        value: { type: String, value: '', observer: '_valueObserver' },
        title: { type: String, value: undefined },
        placeholder: { type: String, value: '' },
        required: { type: Boolean },
        invalid: { type: Boolean },
        readonly: { type: Boolean },
        disabled: { type: Boolean, reflectToAttribute: true },
        fit: { type: Boolean, value: false, reflectToAttribute: true },
        stretch: { type: Boolean, value: false, reflectToAttribute: true },
        grow: { type: Boolean, value: false },
        hideResizer: { type: Boolean, value: false, reflectToAttribute: true }
    };

    static css = css`
        :host {
            display: flex;
            outline: none;
            width: var(--content-width);
        }

        pl-labeled-container {
            width: inherit;
            height: inherit;
            position: relative;
        }

        :host([fit]) {
            width: 100%;
            height: 100%;
        }

        :host([stretch]) {
            --content-width: 100%;
            --textarea-content-width: 100%;
        }

        :host([fit])  {
            --content-width: 100%;
            --content-height: 100%;

            --textarea-content-width: 100%;
            --textarea-content-height: 100%;
        }

        :host([hide-resizer]) textarea {
            resize: none;
        }

        :host([disabled]) {
            color: var(--grey-base);
            cursor: not-allowed;
            pointer-events: none;
            user-select: none;
        }

        :host([disabled]) {
            cursor: not-allowed;
            pointer-events: none;
            user-select: none;
        }

        :host([disabled]) .input-container,
        :host([disabled]) .input-container input,
        :host([disabled]) ::slotted(*),
        :host([disabled]) ::placeholder {
            color: var(--grey-darkest);
            background: var(--grey-lightest);
        }

        :host(:hover) .input-container{
            border: 1px solid var(--grey-dark);
        }

        :host(:active) .input-container{
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
            font: var(--text-font);
            color: var(--text-color);
            border: none;
            min-height: 48px;
            min-width: var(--content-width);
            background: transparent;
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
                <textarea id="nativeTextArea" readonly$="[[readonly]]" value="{{fixText(value)}}" placeholder="[[placeholder]]"
                    title="[[title]]" tabindex$="[[_getTabIndex(disabled)]]" on-focus="[[_onFocus]]" on-input="[[_onInput]]">
                                                    </textarea>
            </div>
            <slot name="label-suffix" slot="label-suffix"></slot>
        </pl-labeled-container>
    `;

    connectedCallback() {
        super.connectedCallback();
        this._nativeTextArea = this.$.nativeTextArea;
        this._inputContainer = this.$.container;

        if (this.variant) {
            console.log('Variant is deprecated, use orientation instead');
            this.orientation = this.variant;
        }
        this.validate();
    }

    fixText(t) {
        if (t === undefined || t === null) return '';
        return t;
    }


    _valueObserver(value) {
        this.validate();
    }

    _onInput() {
        let debouncer = debounce(() => {
            this.value = this._nativeTextArea.value;
        }, 100)

        debouncer();
    }

    validate() {
        if (this.required) {
            if ((this.value == null || this.value === undefined || this.value == '')) {
                this._inputContainer.classList.add('required');
                this.invalid = true;
            } else {
                this._inputContainer.classList.remove('required');
                this.invalid = false;
            }
        }
        this.dispatchEvent(new CustomEvent('validation-changed', { bubbles: true, composed: true }))
    }

    _onFocus(event) {
        var length = this.value?.toString().length || 0;
        this._nativeTextArea.setSelectionRange(length, length);
    }

    _getTabIndex(disabled) {
        return disabled ? -1 : 0;
    }
}

customElements.define('pl-textarea', PlTextArea);