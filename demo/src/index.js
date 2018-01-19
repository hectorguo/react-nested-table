import React, { Component } from 'react';
import { render } from 'react-dom';

import ReactNestedTable from '../../src';
import faker from 'faker';
import hljs from 'highlight.js';
import 'highlight.js/styles/github.css';

class FakeDataGenerator {
    constructor(/*number*/ size) {
        this.size = size || 2000;
        this._cache = [];
    }

    createFakeRowObjectData(/*number*/ index) /*object*/ {
        return {
            id: index,
            firstName: faker.name.firstName(),
            lastName: faker.name.lastName(),
            bs: faker.company.bs(),
            catchPhrase: faker.company.catchPhrase(),
            companyName: faker.company.companyName(),
            detail: {
                firstName: faker.name.firstName(),
                lastName: faker.name.lastName(),
                address: {
                    zipCode: faker.address.zipCode(),
                    city: faker.address.city(),
                    street: faker.address.streetName()
                },
                email: faker.internet.email(),
                avatar: faker.image.avatar(),
                list: faker.lorem.words().split(' ')
            }
        };
    }

    getObjectAt(/*number*/ index) /*?object*/ {
        if (index < 0 || index > this.size) {
            return undefined;
        }
        if (this._cache[index] === undefined) {
            this._cache[index] = this.createFakeRowObjectData(index);
        }
        return this._cache[index];
    }

    /**
     * Populates the entire cache with data.
     * Use with Caution! Behaves slowly for large sizes
     * ex. 100,000 rows
     */
    getAll() {
        if (this._cache.length < this.size) {
            for (var i = 0; i < this.size; i++) {
                this.getObjectAt(i);
            }
        }
        return this._cache.slice();
    }

    getSize() {
        return this.size;
    }
}

const fakeData = new FakeDataGenerator(10).getAll();
const headersMap = {
  id: 'ID',
  firstName: 'First Name',
  lastName: 'Last Name',
  bs: 'Company Contents',
  companyName: 'Company Name',
  detail: 'Detail',
  address: 'Address'
};
const handleCellDisplay = function(key, data) {
    if (key === 'email') {
        return {
            width: 200,
            Cell: cellData => <a href={'mailto:'+data}>{data}</a>
        }
    }

    if (key === 'id') {
        return {
            style: {
                color: 'red'
            }
        }
    }

    if (key === 'bs') {
        return {
            width: 200,
            style: {
                fontWeight: 700,
                backgroundColor: 'yellow'
            }
        }
    }
}

class Demo extends Component {
    componentDidMount() {
        hljs.initHighlightingOnLoad();
    }

    render() {
        
        return (
            <div>
                <h1>react-nested-table Demo</h1>
                <section>
                    <h2>1. Basic Example</h2>
                    <ReactNestedTable data={fakeData} />
                    <h3>Source Code</h3>
                    <pre>
                        <code className="javascript">
                            {`import ReactNestedTable from 'react-nested-table';

var jsonData = ${JSON.stringify(fakeData, null, 2)};

<ReactNestedTable data={jsonData} />

          `}
                        </code>
                    </pre>
                </section>
                <section>
                    <h2>2. Change Table's Header with <code>headersMap</code></h2>
                    <ReactNestedTable data={fakeData} headersMap={headersMap}/>
                    <h3>Source Code</h3>
                    <pre>
                        <code className="javascript">
                            {`import ReactNestedTable from 'react-nested-table';

// change table's header
var headersMap = {
  id: 'ID',
  firstName: 'First Name',
  lastName: 'Last Name',
  bs: 'Company Contents',
  companyName: 'Company Name',
  detail: 'Detail',
  address: 'Address'
};
var jsonData = [...];

<ReactNestedTable data={jsonData} headersMap={headersMap} />

          `}
                        </code>
                    </pre>
                </section>
                <section>
                    <h2>3. Customize Table's Cell with <code>onCellDisplay</code></h2>
                    <ReactNestedTable data={fakeData} onCellDisplay={handleCellDisplay} />
                    <h3>Source Code</h3>
                    <pre>
                        <code className="javascript">
                            {`import ReactNestedTable from 'react-nested-table';

// customize each cell display
var handleCellDisplay = function(key, data) {
    if (key === 'email') {
        const MailLink = <a href={'mailto:'+data}>{data}</a>;

        // options are refered to https://github.com/react-tools/react-table#columns
        return {
            width: 200,
            Cell: cellData => <MailLink />
        }
    }

    if (key === 'id') {
        return {
            style: {
                color: 'red'
            }
        }
    }

    if (key === 'bs') {
        return {
            width: 200,
            style: {
                fontWeight: 700,
                backgroundColor: 'yellow'
            }
        }
    }
}
var jsonData = [...];

<ReactNestedTable data={jsonData} onCellDisplay={handleCellDisplay} />

          `}
                        </code>
                    </pre>
                </section>
            </div>
        );
    }
}

render(<Demo />, document.querySelector('#demo'));
