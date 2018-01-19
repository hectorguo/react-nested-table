# react-nested-table

A react component table for rendering nested json data automatically

[Demo](https://hectorguo.com/react-nested-table/)

## Install

```
npm install --save react-nested-table
```

## Usage

### Render Table through JSON data

```js
import ReactNestedTable from 'react-nested-table';

var jsonData = [{...}];

<ReactNestedTable data={jsonData} />
```

### Change Table's Header

```js
import ReactNestedTable from 'react-nested-table';

var jsonData = [{
    name: 'John Jacobs',
    companyName: 'Hudson, Rohan and Shanahan'
},{
    name: 'Candace Jast',
    companyName: 'Schuppe, Jerde and Mann'
}];

var headersMap = {
    name: 'Full Name',
    companyName: 'Company Name'
}

<ReactNestedTable data={jsonData} headersMap={headersMap} />
```

### Customize Table's Cell

```js
import ReactNestedTable from 'react-nested-table';

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
var jsonData = [{
    id: 0,
    bs: 'B2B productize e-services',
    email: 'Gwen.Kihn@hotmail.com'
},{
    id: 1,
    bs: '24/7 engineer users',
    email: 'Wilburn.Bailey@yahoo.com'
}];

<ReactNestedTable data={jsonData} onCellDisplay={handleCellDisplay} />
```