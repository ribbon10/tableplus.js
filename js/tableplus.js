(function( $ ) {
  
 /* TABLEPLUS PUBLIC CLASS DEFINITION
  * ================================= */

  var Tableplus = function (element, options) {
    this.$element = $(element)
    this.options = $.extend({}, $.fn.tableplus.defaults, options);

    if( this.options.sticky_header )
      this.sticky_header( this.$element );
    if( this.options.scrollbar )
      this.scrollbar( this.$element );
    if( this.options.sortable )
      this.sortable( this.$element );
  }

  Tableplus.prototype = {
    constructor: Tableplus

   , scrollbar: function( table ){
      // create scrollbar elements
      var scrollbar_container = $('<div class="table_scollbar_container"></div>'),
          scrollbar_slider = $('<div class="table_scrollbar_slider"></div>');
      // compose scollbar elements
      scrollbar_container.append(scrollbar_slider);
      table.after(scrollbar_container);
      // preserve options
      var options = this.options;

      var destrory = function(){
        $.remove(scrollbar_container);
      }

      var update_table_scrollbars = function(){
        // get relevant values
        var window_top = window.scrollY,
            window_height = $(window).height(),
            table_body = table.find('> tbody'),
            table_body_top = table_body.position().top,
            table_body_bottom = table_body_top+table_body.height();
            position_offset_correction = table.offset().top-table.position().top;
            top_navbar_height = options.navbar_top_height;
            bottom_navbar_height = options.navbar_bottom_height;
        // correct window top and height width navbar height
        window_top = window_top+top_navbar_height;
        window_height = window_height-top_navbar_height-bottom_navbar_height;
        // calc begin and end of table body
        var begin = (window_top < table_body_top+position_offset_correction) ? table_body_top+position_offset_correction : window_top;
        var end = (window_top+window_height < table_body_bottom+position_offset_correction) ? window_top+window_height : table_body_bottom+position_offset_correction;
        // check if we see the table body
        if( begin > end ) { // we do not see the table body
          // hide scrollbar if table body is not seen
          scrollbar_container.css({visibility: 'hidden'});
        }
        else { // we see the table body
          // show scrollbar if table body is seen
          scrollbar_container.css({visibility: 'visible'});
          // get relevant values
          var table_header = table.find('thead'),
              table_header_height = table_header.height(),
              table_body_height = table_body.outerHeight();
          // do fixed table header correction only if fixed header class is applied to table
          var correction_for_fixed_header = 0;
          if( options.sticky_header )
            correction_for_fixed_header = (begin-window_top > table_header_height) ? 0 : table_header_height-(begin-window_top);
          // change css of container and slider
          var height = end-begin-correction_for_fixed_header;
          scrollbar_container
            .css( { height: height,
                    top: begin+correction_for_fixed_header-position_offset_correction, 
                    left: table_body.position().left+table.outerWidth() } );
          scrollbar_slider
             .css( { top: (begin-table_body_top+correction_for_fixed_header-position_offset_correction)/(table_body_height)*(height), 
                     height: (end-begin-correction_for_fixed_header)/(table_body_height)*(height) } );
        }
      }

      // update initialy
      update_table_scrollbars();
      // hook scrolling
      $(window).scroll( function(eventObject){
        update_table_scrollbars();
      });
      // hook resize
      $(window).resize( function(eventObject){
        update_table_scrollbars();
      });
    }
  , sticky_header : function( table ){
      var header = table.find('thead');
      var footer = table.find('> tfoot');
      // select all table rows
      var header_rows_original = header.find('> tr');
      // clone all table rows
      var header_rows = header_rows_original.clone(true, true);
      // insert cloned rows so that they get correct dymensions
      header.append( header_rows );
      // adapt height of rows
      header_rows.height( function(index, height){
        return header_rows_original.eq(index).height();
      });
      // set width of every column
      header_rows.find('> th').width( function(index, width){
        return width;
      });
      // add special class to rows
      header_rows.addClass('table-sticky-header-row');
      // special class for first sticky header row
      header_rows.eq(0).addClass('table-sticky-header-row-first');
      // adapt margin-top of row -> this is necessary for mulitple header rows
      var header_height_accumulated = 0;
      header_rows.each( function(index, row){
        row = $(row);
        row_height = row.outerHeight();
        $(row).css('margin-top', header_height_accumulated);
        header_height_accumulated += row_height;
      });
      // preserve options
      var options = this.options;

      var destroy = function(){
        $.remove(header_rows);
      }

      // function for updating position of header
      var update_fixed_table_header = function(){
        header_rows.each(function(index, header){
          var header = $(header);
          // read relevant values
          var window_top = window.scrollY,
              table_top = table.position().top,
              table_height = table.height(),
              header_top = header_rows_original.position().top,
              header_height = header_height_accumulated, //header.height(),
              footer_height = footer.height();
              top_navbar_height = options.navbar_top_height;
              position_offset_correction = table.offset().top-table.position().top;
          // correction of window top for navbar
          window_top = window_top+top_navbar_height;
          // deside weather the table is out of scroll
          if( window_top>table_top+position_offset_correction && window_top<table_top+table_height+position_offset_correction ) {
            //console.log('adapt header');
            // check if the header should be fixed or if it should scrolle out
            if( window_top<header_top+table_height-header_height-footer_height+position_offset_correction ) {
              //console.log('fixed header -> we are insite the table');
              header.css( { position: 'fixed',
                            top: top_navbar_height } )
                    .addClass('table-sticky-header-row-is-sticky');
            }
            else {
              //console.log('absolute header -> we do not see the body any more and are scrolling out. perhaps with the footer');
              header.css( { position: 'absolute',
                            top: header_top+table_height-header_height-footer_height } )
                    .removeClass('table-sticky-header-row-is-sticky');
            }
          }
          else {
            //console.log('normal header -> we are above or below the table');
            header.css( { position: 'absolute', 
                          top: header_top } )
                  .removeClass('table-sticky-header-row-is-sticky');
          }
        });
      }

      // update initialy
      update_fixed_table_header();
      // hook scrolling
      $(window).scroll( function(eventObject){
        update_fixed_table_header();
      });
      // hook resize
      $(window).resize( function(eventObject){
        update_fixed_table_header();
      });
    }
  , sortable : function( table ){
      var columns = table.find('thead > tr > th');
      var previous_sorted_column = -1;
      var sort_order_asc = true;
      columns.each( function(index, th){
        // create link in header columns
        var link = $('<a style="display:_block;" href="#"></a>');
        link.append( $(th).contents() )
            .append('<i style="opacity: 0.5;visibility:hidden;" class="icon-chevron-up pull-right table-sort-icon"></i>');
        $(th).empty()
          .append(link);
        // make header responsive
        link.click(function(eventObject){
          // get column index that is clicked
          var column_index = columns.index(th);
          // check if sort order should be changed -> this happens if the same row is sorted again -> default is ascending
          if( column_index==previous_sorted_column )
            sort_order_asc = !sort_order_asc
          else
            sort_order_asc = true
          // remember column we have sorted
          previous_sorted_column = column_index;
          // hide all header icons
          columns.find('> a > i.table-sort-icon').css('visibility', 'hidden');
          // show header icon of this column
          $(this).find('> i.table-sort-icon').css('visibility', 'visible');
          // set correct icon
          if( sort_order_asc )
            $(this).find('> i.table-sort-icon')
              .removeClass('icon-chevron-down')
              .addClass('icon-chevron-up')
          else
            $(this).find('> i.table-sort-icon')
              .addClass('icon-chevron-down')
              .removeClass('icon-chevron-up')
          // get table body rows
          var rows = $(th).closest('table').find('> tbody > tr');
          // function for getting values of column
          var get_value_of_column = function(row, column_index){
            // get text of column
            var text = $(row).find('td').eq(column_index).text();
            // get data type of column
            var column_data_type = columns.eq(column_index).attr('data-type');
            // check data type of column and convert values according
            if( 'number' == column_data_type ) {
              text = text.replace(',', '.')*1;
            }
            // return test
            return text;
          }
          // reverse operand for easier ascending descending sorting
          var reverse_operand = sort_order_asc ? 1 : -1
          // sort rows
          rows.sort(function(a, b){
            x = get_value_of_column(a, column_index);
            y = get_value_of_column(b, column_index);
            // do the sorting
            if( x == y ) {
              // if we are here lets iterate over all columns -> begin at the front
              for( i = 0; i < columns.length; ++i) {
                x = get_value_of_column(a, i);
                y = get_value_of_column(b, i);
                if( x != y ) {
                  return ((x<y) ? -1 : 1)*reverse_operand;
                } 
              }
              return 0;
            }
            else {
              return ((x<y) ? -1 : 1)*reverse_operand;
            }
          });
          // insert sorted rows
          $(th).closest('table').find('> tbody')
            .empty()  
            .append(rows);
          // do not follow link
          return false;
        });
      });
    }
  }


 /* TABLEPLUS PLUGIN DEFINITION
  * ========================= */

  var old = $.fn.tableplus;


  $.fn.tableplus = function ( option ) {
    return this.each(function () {
      var $this = $(this)
        , data = $this.data('tableplus')
        , options = typeof option == 'object' && option
      if (!data) $this.data('tableplus', (data = new Tableplus(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  $.fn.tableplus.Constructor = Tableplus

  $.fn.tableplus.defaults = {
    navbar_top_height: 0,
    navbar_bottom_height: 0,
    sticky_header: true,
    sortable: true,
    scrollbar: true
  }


 /* TABLEPLUS NO CONFLICT
  * =================== */

  $.fn.tableplus.noConflict = function () {
    $.fn.tableplus = old
    return this
  }


 /* TABLEPLUS DATA-API
  * ============== */

  $(window).on('load', function () {
    $("table[class~='table-plus']").tableplus();
  });
})( jQuery );
