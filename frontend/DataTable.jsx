import React from 'react';
import MaterialTable from 'material-table';
import { connect } from 'react-redux';
import s from './DataTable.module.scss';

const DataTable = ({ sheetData, cols }) => {
    const fileName = `report_${new Date().toLocaleDateString('en-GB').replace(/\//g, '_')}.csv`;

    const formattedCols = cols.sort((a, b) => a.title.localeCompare(b.title)).map(c => {
        if (c.field === 'testTransaction') {
           c.hidden = false;
        }
        return c
    });


    return (
        <div className={s.wrap}>
            <MaterialTable
                title="Customer Data Table"
                columns={formattedCols}
                data={sheetData ? sheetData : []}
                options={{
                    filtering: true,
                    columnsButton: true,
                    exportButton: { csv: true, pdf: false},
                    exportFileName: fileName,
                    headerStyle: { position: 'sticky', top: 0 },
                    maxBodyHeight: '600px'
                }}
            />
        </div>
    );
};

const mapStateToProps = (state) => {
    const { sheetData, cols } = state.searchPage;
    return { sheetData, cols }
};
export default connect(mapStateToProps)(DataTable);