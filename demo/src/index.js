import React, { Component } from 'react';
import { render } from 'react-dom';

import ReactNestedTable from '../../src';
import faker from 'faker';
import hljs from 'highlight.js';
import 'highlight.js/styles/github-gist.css';

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

class Demo extends Component {
    componentDidMount() {
        hljs.initHighlightingOnLoad();
    }

    render() {
        return (
            <div>
                <h1>react-nested-table Demo</h1>
                <ReactNestedTable data={fakeData} />
                <h2>Source Code</h2>
                <pre>
                    <code className="javascript">
                        {`import ReactNestedTable from 'react-nested-table';

var jsonData = ${JSON.stringify(fakeData, null, 2)};

<ReactNestedTable data={jsonData} />

          `}
                    </code>
                </pre>
            </div>
        );
    }
}

render(<Demo />, document.querySelector('#demo'));
