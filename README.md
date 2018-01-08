# react-nested-table

A react component table for rendering nested json data automatically

[Demo](https://hectorguo.com/react-nested-table/)

## Install

```
npm install --save react-nested-table
```

## Usage

### Render table through json data

```js
import ReactNestedTable from 'react-nested-table';

var jsonData = [{...}];

<ReactNestedTable data={jsonData} />
```

### Change table header

```js
import ReactNestedTable from 'react-nested-table';

var jsonData = [{
    name: 'John Jacobs',
    companyName: 'Hudson, Rohan and Shanahan'
},{
    name: 'Candace Jast',
    companyName: 'Schuppe, Jerde and Mann'
}];

var headerMaps = {
    name: 'Full Name',
    companyName: 'Company Name'
}

<ReactNestedTable data={jsonData} headerMaps={headerMaps} />
```