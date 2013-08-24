# tableplus (pre-alpha)
some fancy upgrades for html tables rendered with bootstrap.

## About
tableplus is a jQuery plugin for Bootstrap offering 2 fancy features which are usefull for long tables. long means: longer than screen size.
+ First feature makes **table headers sticky** on scrolling. This means when you scroll over a table that is longer than your screen size the table headers will not scroll out. They are visible at the top screen until the table scrolls out.
+ Second feature is a **scrollbar** that indicates how much of a table is displayed on screen.

**IMPORTANT**:
At the moment this plugin is in pre-alpha stage and is only a proof of concept working on latest chrome and firefox using Bootstrap 2.3.2. Lets wait and see if it is leaving this stage one time ;-)

## Screenshot
![screenshot](https://raw.github.com/ribbon10/tableplus.js/master/doc/screenshot.png "Screenshot")

## Example
For an interactive example have a look at the [demo page](http://rawgithub.com/ribbon10/tableplus.js/master/doc/demo.html).

## Getting Started
Download [tabeplus](https://github.com/ribbon10/tableplus.js/archive/master.zip) from github, unzip to your project and load JavaScript & CSS file after jQuery & Bootstrap.
```html
<head>
    ...
    <!-- Bootstrap and jQuery needed by tableplus -->
    <link href="http://netdna.bootstrapcdn.com/twitter-bootstrap/2.3.2/css/bootstrap-combined.min.css" rel="stylesheet">
    <script src="http://code.jquery.com/jquery.js"></script>
    <script src="http://netdna.bootstrapcdn.com/twitter-bootstrap/2.3.2/js/bootstrap.min.js"></script>
    ...
    <!-- tableplus -->
    <link href="tableplus/css/tableplus.css" rel="stylesheet">
    <script src="tableplus/js/tableplus.js"></script>
    ...
</head>
```

## Usage

### Via Attributes
Simple add **classes** to tables, as you would do with other [table styles](http://getbootstrap.com/css/#tables):
```html
<table class="table table-sticky table-scrollbar">
	<thead>
		<tr><th>Header 1</th></tr>
	</thead>
	<tbody>
		<tr><td>Row 1 Column 1</td></tr>
	</tbody>
</table>
```
or via **data attributes**:
```html
<table class="table" data-sticky="true" data-scrollbar="false" >
    <thead>
        <tr><th>Header 1</th></tr>
    </thead>
    <tbody>
        <tr><td>Row 1 Column 1</td></tr>
    </tbody>
</table>
```

### Via JavaScript
Enable manually with:
```javascript
$('table').tableplus();
```

### Options
Options can be passed via data attributes or JavaScript. For data attributes, append the option name to data-, as in data-offset-top=""

Name      | type           | default | description
--------- | -------------- | ------- | -----------
offset    | object, number | 0       | <p>Offset from screen *top* where sticky header is fixed to and where scrollbar begins. Or offset from *bottom* of screen where sticky header is scrolling out and where scrollbar ends.<br />This is needed when a navbar is used that is [fixed to top](http://getbootstrap.com/components/#navbar-fixed-top) or [bottom](http://getbootstrap.com/components/#navbar-fixed-bottom).</p><p>If a number is supplied, the value is applied to top and bottom.<br />Object structure is: offset: { top: 50, bottom: 50 }.</p><p>Tip: By default, top and bottom navbar is 50px high.</p>
sticky    | boolean        | true    | Header of table is getting sticky on scrolling.
scrollbar | boolean        | true    | Scrollbar is rendered.

### Methods
#### .tableplus(options)
Enables tableplus features.
#### .tableplus('repair')
Tries to repair the enabled features. This should be called if tableplus is used with another table libraries, like [WATable](https://github.com/wootapa/watable), when the libraries for e.g. modifies the header rows.

### Events
There are no events available at the moment.
