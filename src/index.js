import "react-table/react-table.css";
import './style.scss';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactTable from 'react-table';
import ImageZoom from 'react-medium-image-zoom';
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


/**
 * Render a table/iframe/list based on data
 * It will automatically change UI by the types of data
 * @param {Array/Object/String} data data needs to be rendered
 */
function renderByData(data, keyMaps, onCellDisplay) {
    if (!data) {
        return null;
    }

    if (isHtml(data)) {
        return <iframe src={data} style={{ height: "50vh", width: "100%" }} />;
    }

    if (isObject(data)) {
        data = [data];
    }

    if (isArray(data)) {
        const dataModel = data[0];

        // used for storing expanding keys in different rows
        let currentExpandedKeys = {};

        // render as a list if there is only String or Number in Array
        if (!isObject(dataModel) && !isArray(dataModel)) {
            return <ul>
                {data.map((item, i) => <li key={`nested_table_${i}`}>{item}</li>)}
            </ul>;
        }

        const columns = dataToColumns(data, keyMaps, onCellDisplay, currentExpandedKeys);

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

                return <div className="react-nested-table-inner">
                    <h4 className="title">{keyMaps[currentExpandedKey] || currentExpandedKey}</h4>
                    {renderByData(row.original[currentExpandedKey], keyMaps, onCellDisplay)}
                </div>
            }}
            // onExpandedChange={(newExpanded, index, event) => {console.log('onExpand', newExpanded, index, event)}}
            getTdProps={(state, rowInfo, column, instance) => {
                return {
                    onClick: (e, handleOriginal) => {
                        // used to identify which column is expanding
                        if (column.expander) {
                            currentExpandedKeys[rowInfo.index] = column.id;
                        }
                        
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
 * Transfer data to columns that is used for rendering table
 * @param {Array} data 
 * @returns {Array} an array of columns configuration
 */
function dataToColumns(data, keyMaps, onCellDisplay, currentExpandedKeys) {
    if (data && data.length) {
        const dataModel = data[0];

        return Object.keys(dataModel).map(key => {
            const currentData = dataModel[key];
            const defaultColumn = {
                Header: keyMaps[key] || key,
                accessor: key,
                width: getTextWidth(key)
            };

            if (onCellDisplay) {
                const column = onCellDisplay(key, currentData);
                return Object.assign({}, defaultColumn, column);
            }

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
                return Object.assign({}, defaultColumn, {
                    Cell: cellData => (
                        <ImageZoom
                            image={{
                                src: cellData.original[key],
                                alt: key,
                                className: 'image'
                            }}
                        />
                )});
            }

            return defaultColumn;
        });

    }
    return [{ Header: 'ID', accessor: 'id' }];

}

class ReactNestedTable extends Component {
    render() {
        return renderByData(this.props.data, this.props.headerMaps, this.props.onCellDisplay);
    }
}

ReactNestedTable.defaultProps = {
    data: [],
    headerMaps: {}
}

ReactNestedTable.propTypes = {
    /**
     * data, should be a json
     */
    data: PropTypes.array.isRequired,
    /**
     *  Mapping between data key and column header title for display
     */
    headerMaps: PropTypes.object,
    onCellDisplay: PropTypes.func
}

export default ReactNestedTable;