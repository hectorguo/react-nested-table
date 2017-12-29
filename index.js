import "react-table/react-table.css";
import '../../../../assets/sass/components/DcpTablePro.scss';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { fetchGet, fetchPost } from '../../io/ajaxCall';
import DcpTable from './DcpTable';
import DcpButton from './DcpButton';
import DcpList from './DcpList';
import DcpIframe from './DcpIframe';
import ReactTable from 'react-table';
import ImageZoom from 'react-medium-image-zoom'
import _ from 'lodash';


const MIN_ROWS = 0;
const PAGE_SIZE = 50;

function uniqId() {
    return `${Date.now()}${Math.random() * 10 | 0}`.substr(5);
}

/**
 * Get the width of text, used for adjusting column width on a table
 * @param {String} text the text that wants to get its width
 * @param {String} font the font style of current text
 * @returns {Number} the width (pixel)
 */
function getTextWidth(text, font = 'bold 18px sans-serif') {
    const minWidth = 25;
    // re-use canvas object for better performance
    const canvas = getTextWidth.canvas || (getTextWidth.canvas = document.createElement("canvas"));
    const context = canvas.getContext("2d");
    context.font = font;
    const metrics = context.measureText(text);
    return Math.max(metrics.width, minWidth);
}

function isArray(val) {
    return Array.isArray(val);
}

function isObject(val) {
    return val && typeof val === 'object' && val.constructor === Object;
}

function isImage(val) {
    if (typeof val !== 'string') {
        return false;
    }
    const fileExtension = val.split('.').pop();
    const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'tiff'];
    return IMAGE_EXTENSIONS.indexOf(fileExtension) > -1;
}

function isHtml(val) {
    return typeof val === 'string' && val.split('.').pop().includes('htm');
}

// Mapping between data key and column header title for display
let keyMaps = {};

// Mapping between data key and data model (schema for columns)
let dataModelMaps = new Map();

// used for storing expanding keys in different rows
let currentExpandedKeys = {};

/**
 * Render a table/iframe/list based on data
 * It will automatically change UI by the types of data
 * @param {Array/Object/String} data data needs to be rendered
 */
function renderByData(data) {
    if (!data) {
        return null;
    }

    if (isHtml(data)) {
        return <DcpIframe src={data} style={{ height: "50vh", width: "100%" }} />;
    }

    if (isObject(data)) {
        data = [data];
    }

    if (isArray(data)) {
        const dataModel = data[0];

        // render as a list if there is only String or Number in Array
        if (!isObject(dataModel) && !isArray(dataModel)) {
            return <DcpList data={data} isRow={true} />;
        }

        const columns = dataToColumns(data);

        return <ReactTable
            data={data}
            columns={columns}
            className="-striped -highlight"
            minRows={0}
            defaultPageSize={PAGE_SIZE}
            showPagination={data && data.length > PAGE_SIZE ? true : false}
            SubComponent={(row) => {
                // get current active key which needs to be expanded (triggered by clicking on a td element)
                const currentExpandedKey = currentExpandedKeys[row.index];

                return <div className="dcp-table-inner">
                    <h4 className="title">{keyMaps[currentExpandedKey] || currentExpandedKey}</h4>
                    {renderByData(row.original[currentExpandedKey])}
                </div>
            }}
            // onExpandedChange={(newExpanded, index, event) => {console.log('onExpand', newExpanded, index, event)}}
            getTdProps={(state, rowInfo, column, instance) => {
                return {
                    onClick: (e, handleOriginal) => {
                        // used to identify which column is expanding
                        currentExpandedKeys[rowInfo.index] = column.id;
                        // IMPORTANT! React-Table uses onClick internally to trigger
                        // events like expanding SubComponents and pivots.
                        // By default a custom 'onClick' handler will override this functionality.
                        // If you want to fire the original onClick handler, call the
                        // 'handleOriginal' function.
                        if (handleOriginal) {
                            handleOriginal()
                        }
                    }
                }
            }}
        />
    }
}

/**
 * Render a table/iframe/list based on data model
 * @param {Array/Object/String} data 
 * @param {Object} dataModel 
 * @returns React Component
 */
function renderByDataModel(data, dataModel) {
    // must be an array / object
    if (dataModel) {
        if (isObject(data)) {
            data = [data];
        }

        const columns = dataModelToColumns(dataModel);

        return <ReactTable
            data={data}
            columns={columns}
            className="-striped -highlight"
            minRows={0}
            defaultPageSize={PAGE_SIZE}
            showPagination={data.length > PAGE_SIZE ? true : false}
            SubComponent={(row) => {
                // get current active key which needs to be expanded (triggered by clicking on a td element)
                const currentExpandedKey = currentExpandedKeys[row.index];
                const dataForChild = row.original[currentExpandedKey];
                const dataModelForChild = dataModelMaps.get(currentExpandedKey);

                return <div className="dcp-table-inner">
                    <h4 className="title">{keyMaps[currentExpandedKey] || currentExpandedKey}</h4>
                    {renderByDataModel(dataForChild, dataModelForChild)}
                </div>
            }}
            // onExpandedChange={(newExpanded, index, event) => {console.log('onExpand', newExpanded, index, event)}}
            getTdProps={(state, rowInfo, column, instance) => {
                return {
                    onClick: (e, handleOriginal) => {
                        // used to identify which column is expanding
                        currentExpandedKeys[rowInfo.index] = column.id;
                        // IMPORTANT! React-Table uses onClick internally to trigger
                        // events like expanding SubComponents and pivots.
                        // By default a custom 'onClick' handler will override this functionality.
                        // If you want to fire the original onClick handler, call the
                        // 'handleOriginal' function.
                        if (handleOriginal) {
                            handleOriginal()
                        }
                    }
                }
            }}
        />;
    }

    // HTML
    if (typeof data === 'string') {
        return <DcpIframe src={data} style={{ height: "50vh", width: "100%" }} />;
    }

    // pure Array
    if (isArray(data)) {
        return <DcpList data={data} isRow={true} />;
    }

    return null;
}

/**
 * Transfer data to columns that is used for rendering table
 * @param {Array} data 
 * @returns {Array} an array of columns configuration
 */
function dataToColumns(data) {
    if (data && data.length) {
        const dataModel = data[0];

        return Object.keys(dataModel).map(key => {
            const currentData = dataModel[key];
            // if (!currentData || !currentData.length) {
            //     return {
            //         Header: keyMaps[key] || key,
            //         accessor: key,
            //         Cell: cellData => (
            //             null
            //         )
            //     };
            // }

            if (isObject(currentData) || isArray(currentData) || isHtml(currentData)) {
                return {
                    expander: true,
                    Header: () => <strong>{keyMaps[key] || key}</strong>,
                    width: 65,
                    id: key,
                    Expander: ({ isExpanded, ...rowInfo }) =>
                        <div>
                            {isExpanded && currentExpandedKeys[rowInfo.index] === key
                                ? <span>&#x2299;</span>
                                : <span>&#x2295;</span>}
                        </div>,
                    style: {
                        cursor: "pointer",
                        fontSize: 25,
                        padding: "0",
                        textAlign: "center",
                        userSelect: "none"
                    }
                };
            }

            if (isImage(currentData)) {
                return {
                    Header: keyMaps[key] || key,
                    accessor: key,
                    Cell: cellData => (
                        <ImageZoom
                            image={{
                                src: cellData.original[key],
                                alt: key,
                                className: 'image'
                            }}
                        />
                    )
                }
            }

            return {
                Header: keyMaps[key] || key,
                accessor: key,
                width: getTextWidth(key)
            };
        });

    }
    return [{ Header: 'ID', accessor: 'id' }];

}

/**
 * Convert dataModel to columns
 * @param {Object} dataModel 
 *  e.g. {
 *      description: 'String',
 *  }
 * @returns {Array} columns config for table
 *  e.g. [{
 *      Header: 'Description',
 *      accessor: 'description'
 *  }]
 */
function dataModelToColumns(dataModel) {
    if (!isObject(dataModel)) {
        return [{ Header: 'ID', accessor: 'id' }];
    }

    return Object.keys(dataModel).map(key => {
        const dataType = dataModel[key];

        switch (dataType) {
            case 'ObjectArray':
            case 'Array':
            case 'Object':
            case 'Html':
                return {
                    expander: true,
                    Header: () => <strong>{keyMaps[key] || key}</strong>,
                    width: 65,
                    id: key,
                    Expander: ({ isExpanded, ...rowInfo }) =>
                        <div>
                            {isExpanded && currentExpandedKeys[rowInfo.index] === key
                                ? <span>&#x2299;</span>
                                : <span>&#x2295;</span>}
                        </div>,
                    style: {
                        cursor: "pointer",
                        fontSize: 25,
                        padding: "0",
                        textAlign: "center",
                        userSelect: "none"
                    }
                }
            case 'Image':
                return {
                    Header: keyMaps[key] || key,
                    accessor: key,
                    Cell: cellData => (
                        <ImageZoom
                            image={{
                                src: cellData.original[key],
                                alt: key,
                                className: 'image'
                            }}
                        />
                    )
                }
            default:
                return {
                    Header: keyMaps[key] || key,
                    accessor: key,
                    width: getTextWidth(key)
                };
        }
    });
}

class DcpTablePro extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: []
        };
    }

    /**
     * Converted nested dataModel to a flat structure
     * @param {Object} dataModel 
     * @returns {Map} a map with single level
     * {
     *  $root: {
     *      detail: 'Object',
     *      name: 'String'
     *  }
     *  detail: {
     *      description: 'String',
     *      list: 'ObjectArray',
     *      endtime: 'Long'
     *  }
     *  list: {
     *      id: 'String',
     *      name: 'String'
     *  }
     * }
     */
    flattenDataModel(dataModel) {
        const result = new Map();

        function getDataType(val) {
            if (isObject(val)) {
                // an array of object
                if (isObject(val[0])) {
                    return 'ObjectArray';
                }

                return val[0] ? 'Array' : 'Object';
            }

            return val;
        }

        // a recursive way to loop data model
        function flatten(model, rootKey = '$root') {
            if (!model) {
                return;
            }

            let dataType = getDataType(model);

            if (dataType === 'ObjectArray') {
                model = model[0];
                dataType = getDataType(model);
            }

            if (dataType === 'Object') {
                const dataTypeMaps = {};
                Object.keys(model).forEach(key => {
                    const value = model[key];
                    const dataType = getDataType(value);
                    dataTypeMaps[key] = dataType;

                    // flatten sub object / array
                    if (dataType === 'ObjectArray' || dataType === 'Object') {
                        flatten(value, key);
                    }
                });

                result.set(rootKey, dataTypeMaps);
            }
        }

        flatten(dataModel);

        return result;
    }

    /**
     * Fetch data from data source, then refresh table
     * @param {Object} props React props
     */
    updateData(props) {
        Promise.all([
            props.dataMappingSrc && fetchGet(props.dataMappingSrc),
            props.dataModelSrc && fetchGet(props.dataModelSrc),
            props.dataFetchMethod === 'GET' ? fetchGet(props.dataSrc) : fetchPost(props.dataSrc)
        ])
            .then(([maps, dataModel, data]) => {
                keyMaps = maps;
                dataModel = props.dataModelPath ? _.get(dataModel, props.dataModelPath) : dataModel;
                data = props.dataPath ? _.get(data, props.dataPath) : data;

                dataModelMaps = this.flattenDataModel(dataModel);
                this.setState({ data });
            });
    }

    componentDidMount() {
        this.updateData(this.props);
    }

    componentWillReceiveProps(nextProps) {
        // If data source changed, refresh data
        if (this.props.dataSrc !== nextProps.dataSrc || this.props.dataModelSrc !== nextProps.dataModelSrc) {
            this.updateData(nextProps);
        }
    }

    render() {
        if (!this.props.dataModelSrc || dataModelMaps.size === 0) {
            return renderByData(this.state.data);
        }

        const dataModel = dataModelMaps.get('$root');
        return renderByDataModel(this.state.data, dataModel);
    }
}

DcpTablePro.defaultProps = {
    dataSrc: '',
    dataMappingSrc: '/fake-data/fieldNameMap.json'
}

DcpTablePro.propTypes = {
    /**
     * data source url, should return a json
     */
    dataSrc: PropTypes.string.isRequired,
    /**
     * data path, which level needs to be got, e.g. "catalogList.devicesModel[0]"
     */
    dataPath: PropTypes.string,
    /**
     * data model definition, used for mapping fields between ui columns and data 
     */
    dataModelSrc: PropTypes.string,
    dataModelPath: PropTypes.string,
    /**
     * data mapping source url, a hashmap which can replace the Headers' title
     * e.g. {
     *   "logo": "Logo",
     *   "shortName": "Short Name"
     * }
     */
    dataMappingSrc: PropTypes.string
}

export default DcpTablePro;