var F3TREE = (function() {

    var CONFIG = {
        lang                    :   'E',
        lang_ISO2               :   'EN',
        I18N_prefix             :   '',
        prefix                  :   '',
        placeholderID           :   '',
        placeholder_top         :   null,
        placeholder_left        :   null,
        labelID                 :   '_default',
        min_height              :   '20px',
        delay                   :   250,
        box_distance            :   9,
        tree_distance           :   18,
        tree_options_open       :   false,
        tree_options_height     :   '30px',
        mode1_open              :   false,
        mode1_height            :   '348px',
        mode1_width             :   '298px',
        mode2_open              :   false,
        mode2_height            :   '148px',
        mode2_width             :   '398px',
        mode3_open              :   false,
        mode3_height            :   '248px',
        mode3_width             :   '248px',
        v_tree_height           :   '346px',
        v_tree_width            :   '296px',
        v_tree_data             :   null,
        default_configuration   :   'classic',
        configurations          :   {
            statistics  :   '/tree/config/FAOSTAT_Statistics.json',
            classic     :   '/tree/config/FAOSTAT_Classic.json'
        },
        selection               :   {
            code        :   null,
            label       :   null,
            isDomain    :   false
        },
        tree_callback           : null
    };

    function init(config) {

        /* Store user preferences. */
        F3TREE.CONFIG = $.extend(F3TREE.CONFIG, config);

        /* Set ISO2 language code. */
        switch (F3TREE.CONFIG.lang) {
            case 'F': F3TREE.CONFIG.lang_ISO2 = 'FR'; break;
            case 'S': F3TREE.CONFIG.lang_ISO2 = 'ES'; break;
            default : F3TREE.CONFIG.lang_ISO2 = 'EN'; break;
        }

        /* Initiate multi-language. */
        $.i18n.properties({
            name        :   'I18N',
            mode        :   'both',
            path        :   F3TREE.CONFIG.I18N_prefix + 'I18N/',
            language    :   F3TREE.CONFIG.lang_ISO2
        });

        /* Load vertical tree data. */
        $.getJSON(F3TREE.CONFIG.configurations[F3TREE.CONFIG.default_configuration], function (data) {
            F3TREE.CONFIG.v_tree_data = data;
        });

        /* Create the placeholder. */
        createPlaceholder();

    };

    function loadConfiguration(configurationID) {

        /* Load vertical tree data. */
        $.getJSON(F3TREE.CONFIG.configurations[configurationID], function (data) {
            F3TREE.CONFIG.v_tree_data = data;
            mode1();
        });

    };

    function createPlaceholder() {
        var s = '<div id="tree-menu-box" class="tree-menu-box" onclick="F3TREE.showTreeOptions();">';
        s += $.i18n.prop(F3TREE.CONFIG.labelID);
        s += '</div>';

        document.getElementById(F3TREE.CONFIG.placeholderID).innerHTML = s;
    };

    function showTreeOptions() {
        if (F3TREE.CONFIG.tree_options_open == true) {
            F3TREE.CONFIG.tree_options_open = false;
            closeTreeOptions();
        } else {
            F3TREE.CONFIG.tree_options_open = true;
            openTreeOptions();
        }
    };

    function openTreeOptions() {

        /* Create icons holder box. */
        var id = 'tree-options-box';
        $('#' + F3TREE.CONFIG.placeholderID).append('<div id="' + id + '" class="fnx-tree-box"></div>');

        /* Add icons. */
        var s = '<div class="placeholder">'
        s += '<div class="h-space" id="space1">&nbsp;</div>';
        s += '<img id="vertical" onclick="F3TREE.mode1();" src="images/mode1.png" class="image" title="' + $.i18n.prop('_vertical_tree') + '">';
        s += '<div class="h-space" id="space2">&nbsp;</div>';
        s += '<img id="horizontal" onclick="F3TREE.mode2();" src="images/mode2.png" class="image" title="' + $.i18n.prop('_horizontal_tree') + '">';
        s += '<div class="h-space" id="space3">&nbsp;</div>';
        s += '<img id="alphabetical" onclick="F3TREE.mode3();" src="images/mode3.png" class="image" title="' + $.i18n.prop('_alphabetical_order') + '">';
        s += '<div class="h-space">&nbsp;</div>';
        s += '</div>';
        document.getElementById('tree-options-box').innerHTML = s;

        /* Compute the position of the original placeholder. */
        var position = $('#tree-menu-box').position();
        F3TREE.CONFIG.placeholder_top = position.top;
        F3TREE.CONFIG.placeholder_left = position.left;
        var height = px2int($('#tree-menu-box').css('height'));
        var width = px2int($('#tree-menu-box').css('width')) - 8;
        $('#' + id).css('display', 'inline');
        $('#' + id).css('top', F3TREE.CONFIG.placeholder_top);
        $('#' + id).css('left', F3TREE.CONFIG.placeholder_left);
        $('#' + id).css('width', width);
        $('#' + id).css('height', height);


        // TODO Find a way to make the alignment dynamic
        $('#vertical').css('left', (F3TREE.CONFIG.placeholder_left) + 'px');
        $('#horizontal').css('left', (F3TREE.CONFIG.placeholder_left) + 'px');
        $('#alphabetical').css('left', (F3TREE.CONFIG.placeholder_left) + 'px');

        /* Show the icons holder box. */
        $('#' + id).animate(
            {
                top: '+=' + (parseInt(F3TREE.CONFIG.box_distance) + parseInt(height)) + 'px'
            }, F3TREE.CONFIG.delay).animate({
                height: F3TREE.CONFIG.tree_options_height
            }, F3TREE.CONFIG.delay, function() {
                open('vertical', F3TREE.CONFIG.mode1_width, F3TREE.CONFIG.mode1_height, buildVerticalTree);
            });

    };

    function closeTreeOptions() {
        close();
        var height = px2int(F3TREE.CONFIG.min_height);
        $('#tree-options-box').animate(
            {
                height: F3TREE.CONFIG.min_height
            }, F3TREE.CONFIG.delay, function() {
                $('#tree-options-box').remove();
            }).animate(
            {
                top: '-=' + (parseInt(F3TREE.CONFIG.box_distance) + parseInt(height)) + 'px'
            }, F3TREE.CONFIG.delay);
    };

    function destroyTreeBox() {
        $('#fnx-tree-box').remove();
    };

    function close() {
        var height = px2int(F3TREE.CONFIG.min_height);
        $('#fnx-tree-box').animate(
            {
                height: F3TREE.CONFIG.min_height
            }, F3TREE.CONFIG.delay, function() {
                destroyTreeBox();
            }).animate(
            {
                top: '-=' + (parseInt(F3TREE.CONFIG.box_distance) + parseInt(height)) + 'px'
            }, F3TREE.CONFIG.delay);
    };

    function mode1() {
        if (F3TREE.CONFIG.mode1_open == true) {
            F3TREE.CONFIG.mode1_open = false;
            close();
        } else {
            F3TREE.CONFIG.mode1_open = true;
            open('vertical', F3TREE.CONFIG.mode1_width, F3TREE.CONFIG.mode1_height, buildVerticalTree);
        }
    };

    function mode2() {
        if (F3TREE.CONFIG.mode2_open == true) {
            F3TREE.CONFIG.mode2_open = false;
            close();
        } else {
            F3TREE.CONFIG.mode2_open = true;
            open('horizontal', F3TREE.CONFIG.mode2_width, F3TREE.CONFIG.mode2_height, buildHorizontalTree);
        }
    };

    function mode3() {
        if (F3TREE.CONFIG.mode3_open == true) {
            F3TREE.CONFIG.mode3_open = false;
            close();
        } else {
            F3TREE.CONFIG.mode3_open = true;
            open('alphabetical', F3TREE.CONFIG.mode3_width, F3TREE.CONFIG.mode3_height, buildAlphabeticalTree);
        }
    };

    function open(iconID, boxWidth, boxHeight, callback) {
        createTreeBox();
        var height_1 = px2int($('#tree-menu-box').css('height'));
        var height_2 = px2int($('#tree-options-box').css('height'));
        $('#fnx-tree-box').css('display', 'inline');
        $('#fnx-tree-box').css('top', F3TREE.CONFIG.placeholder_top);
        $('#fnx-tree-box').css('left', F3TREE.CONFIG.placeholder_left);
        $('#fnx-tree-box').animate(
            {
                top: '+=' + (F3TREE.CONFIG.tree_distance + parseInt(height_1) + parseInt(height_2)) + 'px'
            }, F3TREE.CONFIG.delay).animate(
            {
                width   : boxWidth,
                height  : boxHeight
            }, F3TREE.CONFIG.delay, function() {
                callback();
            });
    };

    function createTreeBox() {
        $('#' + F3TREE.CONFIG.placeholderID).append('<div id="fnx-tree-box" class="fnx-tree-box"><div id="vertical_tree"></div></div>');
        document.getElementById('vertical_tree').innerHTML = "Loading... <img src='images/loading.gif'>";
    };

    function destroyTreeBox() {
        $('#fnx-tree-box').remove();
    };

    function px2int(s) {
        return s.substring(0, s.indexOf('px'));
    }

    function buildHorizontalTree() {
        alert('buildHorizontalTree');
    };

    function buildAlphabeticalTree() {
        alert('buildAlphabeticalTree');
    };

    function buildVerticalTree() {
        var source = {
            datatype: 'json',
            datafields: [
                {name: 'value'},
                {name: 'name'},
                {name: 'parent'}
            ],
            id: 'value',
            localdata: F3TREE.CONFIG.v_tree_data
        };
        var dataAdapter = new $.jqx.dataAdapter(source);
        dataAdapter.dataBind();
        var records = dataAdapter.getRecordsHierarchy('value', 'parent', 'items', [{name: 'name', map: 'label'}]);
        $('#vertical_tree').jqxTree({
            source  :   records,
            width   :   F3TREE.CONFIG.v_tree_width,
            height  :   F3TREE.CONFIG.v_tree_height
        });
        $('#vertical_tree').on('select', function (event) {
            var args = event.args;
            var item = $('#vertical_tree').jqxTree('getItem', args.element);
            F3TREE.CONFIG.selection.code = item.value;
            F3TREE.CONFIG.selection.label = item.label;
            F3TREE.CONFIG.selection.isDomain = !item.hasItems;
            F3TREE.CONFIG.tree_callback(F3TREE.CONFIG.selection);
        });
    };

    return {
        CONFIG              :   CONFIG,
        init                :   init,
        showTreeOptions     :   showTreeOptions,
        mode1               :   mode1,
        mode2               :   mode2,
        mode3               :   mode3,
        loadConfiguration   :   loadConfiguration
    };

})();