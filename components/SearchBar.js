class SearchBar extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({ mode: 'open' });
	}

	connectedCallback() {
		this.render();
		this.addEventListeners();
	}

	render() {
		this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    font-family: 'Geist', sans-serif;
                }
                .search-bar-container {
                    margin-bottom: 1rem;
                }
                .search-bar {
                    display: flex;
                    align-items: center;
                    width: 85%;
                    border: 1px solid #e0e0e0;
                    border-radius: 0.5rem;
                    padding: 0.5rem 1rem;
                    background-color: #fafafa;
                }
                .search-input-field {
                    flex-grow: 1;
                    border: none;
                    outline: none;
                    background: transparent;
                    font-size: 1rem;
                }
                .search-input-field::placeholder {
                    color: #9ca3af;
                }
                .search-btn, #searchClear {
                    background: none;
                    border: none;
                    cursor: pointer;
                    padding: 0;
                    display: flex;
                    align-items: center;
                }
                #searchClear {
                    display: none;
                    padding-left: 0.75rem;
                }
                svg {
                    width: 1.5rem;
                    height: 1.5rem;
                    stroke: #6b7280;
                }
            </style>
            <div class="search-bar-container">
                <div class="search-bar">
                    <input type="text" id="search-input" placeholder="Search partner name..." class="search-input-field" />
                    <button id="searchClear">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
                        </svg>
                    </button>
                    <button class="search-btn">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5">
                            <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                        </svg>
                    </button>
                </div>
            </div>
        `;
	}

	addEventListeners() {
		const input = this.shadowRoot.querySelector('#search-input');
		const clearBtn = this.shadowRoot.querySelector('#searchClear');

		input.addEventListener('keyup', () => {
			clearBtn.style.display = input.value ? 'flex' : 'none';
			this.dispatchEvent(
				new CustomEvent('search', {
					detail: input.value.toLowerCase(),
				})
			);
		});

		clearBtn.addEventListener('click', () => {
			input.value = '';
			clearBtn.style.display = 'none';
			this.dispatchEvent(
				new CustomEvent('search', {
					detail: '',
				})
			);
		});
	}
}

customElements.define('search-bar', SearchBar); 