(function( $ ) {
  
 /* TABLEPLUS PUBLIC CLASS DEFINITION
  * ================================= */

  var Tableplus = function (element, options) {
    this.$element = $(element);
    this.options = $.extend({}, $.fn.tableplus.defaults, options);

    // sortable first because it can change the header width
    if( this.options.sortable )
      this.sortable();
    if( this.options.sticky_header )
      this.sticky_header();
    if( this.options.scrollbar )
      this.scrollbar();
  }

  Tableplus.prototype = {
    constructor: Tableplus

   , scrollbar: function(){
      // create scrollbar elements
      this.scrollbar_container = $('<div class="table_scollbar_container"></div>'),
      this.scrollbar_slider = $('<div class="table_scrollbar_slider"></div>');
      // compose scollbar elements
      this.scrollbar_container.append(this.scrollbar_slider);
      this.$element.after(this.scrollbar_container);

      // update initialy
      this.update_table_scrollbars();
      // hook scrolling
      $(window).scroll( $.proxy( this.update_table_scrollbars, this) );
      // hook resize
      $(window).resize( $.proxy( this.update_table_scrollbars, this) );
    }
  , update_table_scrollbars : function(){
      var options = this.options;

      // get relevant values
      var window_top = window.scrollY,
          window_height = $(window).height(),
          table_body = this.$element.find('> tbody'),
          table_body_top = table_body.position().top,
          table_body_bottom = table_body_top+table_body.height();
          position_offset_correction = this.$element.offset().top-this.$element.position().top;
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
        this.scrollbar_container.css({visibility: 'hidden'});
      }
      else { // we see the table body
        // show scrollbar if table body is seen
        this.scrollbar_container.css({visibility: 'visible'});
        // get relevant values
        var table_header = this.$element.find('thead'),
            table_header_height = table_header.height(),
            table_body_height = table_body.outerHeight();
        // do fixed table header correction only if fixed header class is applied to table
        var correction_for_fixed_header = 0;
        if( options.sticky_header )
          correction_for_fixed_header = (begin-window_top > table_header_height) ? 0 : table_header_height-(begin-window_top);
        // change css of container and slider
        var height = end-begin-correction_for_fixed_header;
        this.scrollbar_container
          .css( { height: height,
                  top: begin+correction_for_fixed_header-position_offset_correction, 
                  left: table_body.position().left+this.$element.outerWidth() } );
        this.scrollbar_slider
           .css( { top: (begin-table_body_top+correction_for_fixed_header-position_offset_correction)/(table_body_height)*(height), 
                   height: (end-begin-correction_for_fixed_header)/(table_body_height)*(height) } );
      }
    }
  , sticky_header : function(){
      // create headers
      this.sticky_header_create_headers();

      // update initialy
      this.update_fixed_table_header();
      // hook scrolling
      $(window).scroll( $.proxy( this.update_fixed_table_header, this) );
      // hook resize
      $(window).resize( $.proxy( this.update_fixed_table_header, this) );
    }
  , sticky_header_create_headers : function(){
      var header = this.$element.find('thead');
      // select all table rows
      this.header_rows_original = header.find('> tr');
      // clone all table rows
      this.header_rows = this.header_rows_original.clone(true, true);
      // insert cloned rows so that they get correct dymensions
      header.append( this.header_rows );
      // add special class to rows
      this.header_rows.addClass('table-sticky-header-row');
      // special class for first sticky header row
      this.header_rows.eq(0).addClass('table-sticky-header-row-first');    
  }
  // be sure that all headers are still present. if not, create them again.
  , fixed_header_repair : function(){
    var _this = this;
    this.header_rows.each( function(){
      if( !$.contains(document.body, this) ){
        _this.header_rows.remove();
        _this.header_rows = undefined;
        return false;
      }
    });
    if( undefined == this.header_rows ){
      this.sticky_header_create_headers();
    }
  }
  // function for updating position of header
  , update_fixed_table_header : function(){
      var originals = this.header_rows_original;
      var table = this.$element;
      var options = this.options;

      // adapt height of rows
      this.header_rows.height( function(index, height){
        return originals.eq(index).height();
      });
      // adapt width of rows
      this.header_rows.width( function(index, width){
        return originals.eq(index).width();
      });
      // set width of every column
      this.header_rows.find('> th').width( function(index, width){
        return originals.find('> th').eq(index).width();
      });
      // adapt margin-top of row -> this is necessary for mulitple header rows
      var header_height_accumulated = 0;
      this.header_rows.each( function(index, row){
        row = $(row);
        row_height = row.outerHeight();
        $(row).css('margin-top', header_height_accumulated);
        header_height_accumulated += row_height;
      });      this.header_rows.each(function(index, header_row){
        var header_row = $(header_row);
        // read relevant values
        var window_top = window.scrollY,
            table_top = table.position().top,
            table_height = table.height(),
            header_top = originals.position().top,
            header_height = header_height_accumulated,
            footer_height = table.find('> tfoot').height();
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
            header_row.css( { position: 'fixed',
                              top: top_navbar_height,
                              left: table.offset().left-window.scrollX } )
                      .addClass('table-sticky-header-row-is-sticky');
          }
          else {
            //console.log('absolute header -> we do not see the body any more and are scrolling out. perhaps with the footer');
            header_row.css( { position: 'absolute',
                              top: header_top+table_height-header_height-footer_height,
                              left: 0 } )
                      .removeClass('table-sticky-header-row-is-sticky');
          }
        }
        else {
          //console.log('normal header -> we are above or below the table');
          header_row.css( { position: 'absolute', 
                            top: header_top,
                            left: 0 } )
                   .removeClass('table-sticky-header-row-is-sticky');
        }
      });
    } 
  , sortable : function( ){
      var table = this.$element;
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
          table.find('thead > tr > th > a > i.table-sort-icon').css('visibility', 'hidden');
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
