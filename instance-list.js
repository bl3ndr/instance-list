import {html, PolymerElement} from '@polymer/polymer/polymer-element.js';
import '@polymer/iron-ajax/iron-ajax.js';
import '@polymer/paper-button/paper-button.js';
import '@polymer/paper-input/paper-input';

/**
 * `instance-list`
 *
 *
 * @customElement
 * @polymer
 * @demo demo/index.html
 */
class InstanceList extends PolymerElement {
    static get template() {
        return html`
      <style>
        :host {
          display: block;
        }
      </style>
      <iron-ajax id="display" url$="[[baseUrl]]/public/instance" method="get" last-response="{{data}}"></iron-ajax>
      <iron-ajax id="command" content-type="application/json" url$="[[baseUrl]]{{_rTail}}" body="[[body]]" method="[[_method]]" on-response="_handleCommandResponse"></iron-ajax>
      <dom-repeat items="{{data}}">
        <template>
            <h2>[[item.title]]</h2>
            <dom-repeat items="{{item._links.self}}" as="link">
                <template>
                    <paper-button on-click="_cmd">[[link.type]]</paper-button>            
                </template>
            </dom-repeat>
        </template>
      </dom-repeat>
      <paper-input type="text" value="{{newInstance.title}}"></paper-input>
      <paper-button on-click="_create">save</paper-button>
    `;
    }

    static get properties() {
        return {
            baseUrl: {
                type: String,
                value: "http://localhost:8080"
            },
            newInstance: {
                type: Object,
                value: {"title": ""}
            },
            data: {
                type: Array,
                value: [],
            },
            _rTail: {
                type: String,
                value: "/public/instance"
            },
            _method: {
                type: String,
                value: "GET"
            }

        };
    }

    connectedCallback() {
        super.connectedCallback();
        this.observe()
    }

    observe() {
        var source = new EventSource("http://localhost:8080/public/instance/stream");


        source.onopen = function () {

            this.connectionOpen(true);

        }.bind(this);

        source.onerror = function () {

            this.connectionOpen(false);

        }.bind(this);


        source.addEventListener('connections', this.updateConnections, false);

        source.addEventListener('requests', this.updateRequests, false);

        source.addEventListener('uptime', this.updateUptime, false);


        source.onmessage = function (event) {
            console.log(event)
            var data = JSON.parse(event.data);
            // a message without a type was fired
            console.log(data._links.self)
            this.push("data", data);
        }.bind(this);

    }

    connectionOpen(state) {
    }

    updateConnections(e) {
        console.log(e);
    }

    updateRequests(e) {
        console.log(e);
    }

    updateUptime(e) {
        console.log(e);
    }


    reload() {
        let req = this.shadowRoot.querySelector("#display");
        req.generateRequest();
    }

    sendRequest() {
        let req = this.shadowRoot.querySelector("#command");
        req.generateRequest();
    }

    _create() {
        this._rTail = "/public/instance";
        this._method = "post";
        this.body = JSON.stringify(this.newInstance);

        console.log(this.newInstance);
        this.sendRequest()
    }

    _cmd(e) {
        let item = e.model.link;
        console.log(item);
        this._rTail = item.href;
        this._method = item.type;

        this.sendRequest()
    }

    _handleCommandResponse(e, detail) {
        console.log(detail.xhr.response);
    }
}

window.customElements.define('instance-list', InstanceList);
