import { PlElement, html, css } from "polylib";
import { debounce } from "@plcmp/utils";

import "@plcmp/pl-labeled-container";

class PlTextArea extends PlElement {
    static get properties() {
        return {
            label: { type: String },
            variant: { type: String },
            value: { type: String, value: '', observer: '_valueObserver' },
            placeholder: { type: String, value: '' },
            required: { type: Boolean },
            invalid: { type: Boolean },
            disabled: { type: Boolean, reflectToAttribute: true },
            fit: { type: Boolean, value: false, reflectToAttribute: true },
            grow: { type: Boolean, value: false },
            hideResizer: { type: Boolean, value: false, reflectToAttribute: true}
        };
    }

    static get css() {
        return css`
            :host([fit]) {
                width: 100%;
                height: 100%;
            }

            :host([fit]) pl-labeled-container {
                width: 100%;
                height: 100%;
            }

            :host([fit])  {
                --content-width: 100%;
                --content-height: 100%;

                --textarea-content-width: 100%;
                --textarea-content-height: 100%;
            }

            :host([fit]) .input-container{
                width: 100%;
                height: 100%;
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

            :host([disabled]) .input-container,
			:host([disabled]) ::placeholder {
				color: var(--grey-base);
                background: var(--grey-lightest);
            }

            :host(:hover) .input-container textarea{
                border: 1px solid var(--grey-dark);
			}

            :host(:active) .input-container textarea{
                border: 1px solid var(--primary-base);
			}

			.input-container:focus-within textarea{
                border: 1px solid var(--primary-base) !important;
			}

			:host([invalid]) .input-container textarea{
				border: 1px solid var(--negative-base) !important;
			}

			textarea {
				background: var(--surface-color);
                outline:none;
				padding: var(--space-sm) 0 0 var(--space-md);
				width: var(--textarea-content-width, 200px);
				height: var(--textarea-content-height, 80px);
                box-sizing: border-box;
                font: var(--text-font);
                color: var(--text-color);
                border: 1px solid var(--grey-light);
				border-radius: 4px;
                min-height: 48px;
                min-width: var(--content-width);
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
			}

            .input-container::before {
                content: '';
                display: block;
                position: absolute;
                box-sizing: border-box;
                top: 0;
                left: 0;
            }

            .input-container.required::before {
				border-top: calc(var(--space-md) / 2) solid var(--attention);
				border-left: calc(var(--space-md) / 2)  solid var(--attention);
				border-bottom: calc(var(--space-md) / 2) solid transparent;
				border-right: calc(var(--space-md) / 2) solid transparent;
            }

			::placeholder {
				color: var(--grey-dark);
			}
    	`;
    }

    static get template() {
        return html`
            <pl-labeled-container variant$="[[variant]]" label="[[label]]">
                <slot name="label-prefix" slot="label-prefix"></slot>
                <div class="input-container">
                    <textarea
                        value="{{value}}"
                        placeholder="[[placeholder]]"
                        title="[[value]]"
                        tabindex$="[[_getTabIndex(disabled)]]"
                        on-focus="[[_onFocus]]"
                        on-input="[[_onInput]]">
                    </textarea>
                </div>
                <slot name="label-suffix" slot="label-suffix"></slot>
            </pl-labeled-container>
		`;
    }

    connectedCallback() {
        super.connectedCallback();
        this._nativeTextArea = this.root.querySelector('textarea');
        this._inputContainer = this.root.querySelector('.input-container');
        this.validate();
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