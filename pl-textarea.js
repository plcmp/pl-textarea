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
            --pl-content-width: 100%;
            --pl-textarea-content-width: 100%;
            width: 100%;
            flex-shrink: 1;
        }

        :host([fit])  {
            --pl-content-width: 100%;
            --pl-content-height: 100%;

            --pl-textarea-content-width: 100%;
            --pl-textarea-content-height: 100%;

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
            color: var(--pl-grey-darkest);
            background: var(--pl-grey-lightest);
            cursor: not-allowed;
            user-select: none;
        }

        :host([:not(disabled)]:hover) .input-container {
            border: 1px solid var(--pl-primary-dark);
        }

        :host([:not(disabled)]:active) .input-container {
            border: 1px solid var(--pl-primary-base);
        }

        .input-container:focus-within{
            border: 1px solid var(--pl-primary-base) !important;
        }

        .input-container.invalid {
            border: 1px solid var(--pl-negative-base);
        }

        .input-container.invalid:focus-within {
            border: 1px solid var(--pl-negative-base);
        }

        .input-container.required.invalid {
            border: 1px solid var(--pl-grey-base);
        }

        textarea {
            outline:none;
            padding-block-start: var(--pl-space-xs);
            padding-inline-end: var(--pl-space-xs);
            padding-block-end: 0;
            padding-inline-start: var(--pl-space-xs);
            width: var(--pl-textarea-content-width, 200px);
            height: var(--pl-textarea-content-height, 80px);
            box-sizing: border-box;
            border: none;
            min-height: calc(var(--pl-base-size) * 2);
            min-width: var(--pl-content-width);
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
            border-radius: var(--pl-border-radius);
            width: 100%;
            height: 100%;
            border: 1px solid var(--pl-grey-base);
            border-radius: var(--pl-border-radius);
            background: var(--pl-background-color);
            font: var(--pl-text-font);
            color: var(--pl-text-color);
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
			border-block-start: calc(var(--pl-space-md) / 2) solid var(--pl-attention);
			border-inline-start: calc(var(--pl-space-md) / 2)  solid var(--pl-attention);
			border-inline-end: calc(var(--pl-space-md) / 2) solid transparent;
			border-block-end: calc(var(--pl-space-md) / 2) solid transparent;
        }

        ::placeholder {
            color: var(--pl-grey-dark);
        }
    `;

    static template = html`
        <pl-labeled-container orientation="[[orientation]]" label="[[label]]">
            <slot name="label-prefix" slot="label-prefix"></slot>
            <div class="input-container" id="inputContainer">
                <textarea id="nativeTextArea" disabled$="[[_toBool(disabled)]]" readonly$="[[_toBool(readonly)]]" value="{{fixText(value)}}" placeholder="[[placeholder]]"
                    title="[[fixText(title)]]" tabindex$="[[_getTabIndex(disabled)]]" on-focus="[[_onFocus]]" on-input="[[_onInput]]"></textarea>
            </div>
            <slot name="label-suffix" slot="label-suffix"></slot>
        </pl-labeled-container>
    `;

    connectedCallback() {
        super.connectedCallback();
        this.validators = [];
        this._validationResults = [];
        this.validators.push(this.defaultValidators.bind(this));
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

    _onInput= debounce(() => {
        this.value = this.$.nativeTextArea.value;
    }, 100);

    defaultValidators(value) {
        let messages = [];

        if ((value === '' || value === null || value === undefined) && this.required) {
            messages.push('Значение не может быть пустым');
        }

        return messages.length > 0 ? messages.join(';') : undefined;
    }

    async validate() {
        const result = await Promise.all(this.validators.map(x => x(this.value)));
        this._validationResults = result.filter(x => x);

        this.invalid = this._validationResults.length > 0 && !this.disabled
        if (this.invalid && this._validationResults.find(x => x.includes('Значение не может быть пустым'))) {
            this.$.inputContainer.classList.add('required');
        } else {
            this.$.inputContainer.classList.remove('required');
        }

        if (this.invalid) {
            this.$.inputContainer.classList.add('invalid');
        } else {
            this.$.inputContainer.classList.remove('invalid');
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