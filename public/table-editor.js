var TableEditor = {
    init: (settings) => {
        TableEditor.config = {
            tableName: '#tableEditor',
            controlHeader: 'Actions',
            addButton: false,
            addButtonText: 'New Row',
            deleteRow: false,
            onDelete: function() {},
            onEdit: function() {},
            onAdd: function() {},
            editBtnHTML: `<button id="teEdit" type="button" class="btn btn-sm btn-default">
                            <span class="fa fa-edit" > </span>
                        </button>`,
            delBtnHTML: `<button id="teDelete" type="button" class="btn btn-sm btn-default">
                            <span class="fa fa-trash" > </span>
                        </button>`,
            accBtnHTML: `<button id="teAccept" type="button" class="btn btn-sm btn-default" style="display:none;">
                            <span class="fa fa-check-circle" > </span>
                        </button>`,
            cancelBtnHTML: `<button id="teCancel" type="button" class="btn btn-sm btn-default" style="display:none;">
                                <span class="fa fa-times-circle" > </span>
                            </button>`,
            buttonHTML: () => {
                let html;
                if (TableEditor.config.deleteRow) {
                    html = TableEditor.config.editBtnHTML + TableEditor.config.delBtnHTML + TableEditor.config.accBtnHTML + TableEditor.config.cancelBtnHTML
                } else {
                    html = TableEditor.config.editBtnHTML + TableEditor.config.accBtnHTML + TableEditor.config.cancelBtnHTML
                }
                return html
            }
        }

        $.extend( TableEditor.config, settings )

        TableEditor.setup()
    },

    setup: () => {
        TableEditor.table = $(TableEditor.config.tableName)

        TableEditor.table.find('thead tr').append('<th name="tableeditor-control-header">' + TableEditor.config.controlHeader + '</th>')
        TableEditor.table.find('tbody tr').append('<td name="tableeditor-controls">' + TableEditor.config.buttonHTML() + '</td>')
        
        if (TableEditor.config.addButton === true) {
            TableEditor.table.before('<button id="' + TableEditor.config.tableName.replace('#', '') + '-add" class="btn btn-dark my-1">' + TableEditor.config.addButtonText + '</button>')          
            TableEditor.table.parent().find(TableEditor.config.tableName + '-add').click(() => { TableEditor._addRow() })
        }

        TableEditor._bindClickEvents()
    },

    destroy: () => {
        TableEditor.table.find('th[name="tableeditor-control-header"]').remove();
        TableEditor.table.find('td[name="tableeditor-controls"]').remove();
        $(TableEditor.config.tableName + '-add').remove()
    },

    refresh: () => {
        TableEditor.destroy()
        TableEditor.init()
    },

    currentRowEditing(currentRow) {
        if (currentRow.attr('data-status') === 'editing') {
            return true;
        } else {
            return false;
        }
    },

    _normalMode: (button) => {
        $(button).parent().find('#teAccept').hide()
        $(button).parent().find('#teCancel').hide()
        $(button).parent().find('#teEdit').show()
        $(button).parent().find('#teDelete').show()
        let currentRow = $(button).parents('tr');
        currentRow.attr('data-status', ''); 
    },

    _editMode: (button) => {
        $(button).parent().find('#teAccept').show()
        $(button).parent().find('#teCancel').show()
        $(button).parent().find('#teEdit').hide()
        $(button).parent().find('#teDelete').hide()
        let currentRow = $(button).parents('tr');
        currentRow.attr('data-status', 'editing'); 
    },

    _editRow: (button) => {
        let currentRow = $(button).parents('tr');
        let columns = currentRow.find('td');

        if (TableEditor.currentRowEditing(currentRow)) return;

        TableEditor._modifyEachColumn(columns, function(column) { 
            let content = column.html();
            let div = '<div style="display: none;">' + content + '</div>';
            let input = '<input class="form-control input-sm"  data-original-value="' + content + '" value="' + content + '">';
            column.html(div + input);
          });
          TableEditor._editMode(button);
    },

    _deleteRow(button) {
          let currentRow = $(button).parents('tr');
          currentRow.remove();
          TableEditor.config.onDelete(currentRow.find('th').html())
    },

    _acceptRow(button) {
          let currentRow = $(button).parents('tr');
          let columns = currentRow.find('td');
          if (!TableEditor.currentRowEditing(currentRow)) return;
          
          let columnData = []
          TableEditor._modifyEachColumn(columns, function(column) {
            let content = column.find('input').val();
            columnData.push(content)
            column.html(content);                         
          });
          TableEditor._normalMode(button);

          if (currentRow.attr('name') == 'new') {
              currentRow.removeAttr('name')
              TableEditor.config.onAdd(columnData)
          } else {
              TableEditor.config.onEdit(currentRow.find('th').html(), columnData)
          }
    },

    _cancelRow(button) {
          let currentRow = $(button).parents('tr');       // access the row
          let columns = currentRow.find('td');              // read fields
          if (!TableEditor.currentRowEditing(currentRow)) return;   // not currently editing, return
      
          TableEditor._modifyEachColumn(columns, function(column) {  // modify each column
              let content = column.find('div').html();    // read div content
              column.html(content);                       // set the content and remove the input fields
          });
          TableEditor._normalMode(button);
    },

    _addRow: () => {
        let allRows = TableEditor.table.find('tbody tr');
        if (allRows.length==0) {
            TableEditor.table.find('tbody').append("<tr name='new'><th scope='row'></th><td></td><td></td><td></td><td name='tableeditor-controls'>" + TableEditor.config.buttonHTML() + "</td></tr>");
        } else {
            let lastRow = TableEditor.table.find('tr:last');
            let newRow = lastRow.clone();
            let columns = newRow.find('td')

            newRow.attr('name', 'new')

            columns.each(function() {
                if ($(this).attr('name') != 'tableeditor-controls') {
                    $(this).html('');
                }
            });
            newRow.appendTo(lastRow.parent())
        }
        TableEditor._bindClickEvents();
    },

    _modifyEachColumn: (columns, theColumn) => {
        let n = 0;
          columns.each(function() {
            n++;
            if ($(this).attr('name')=='tableeditor-controls') return;
            theColumn($(this));  
          });
    },

    _bindClickEvents: () => {
        TableEditor.table.find('tbody tr #teEdit').each(function() {let button = this; button.onclick = function() {TableEditor._editRow(button)} });
        TableEditor.table.find('tbody tr #teDelete').each(function() {let button = this; button.onclick = function() {TableEditor._deleteRow(button)} });
        TableEditor.table.find('tbody tr #teAccept').each(function() {let button = this; button.onclick = function() {TableEditor._acceptRow(button)} });
        TableEditor.table.find('tbody tr #teCancel').each(function() {let button = this; button.onclick = function() {TableEditor._cancelRow(button)} });
    }
};