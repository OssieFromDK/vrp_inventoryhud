var type = "normal";
var disabled = false;
var disabledFunction = null;

window.addEventListener("message", function (event) {
    if (event.data.action == "display") {
        type = event.data.type;
        disabled = false;

        if (type === "normal") {
            $(".info-div").hide();
        } else if (type === "trunk") {
            $(".info-div").show();
        } else if (type === "property") {
            $(".info-div").hide();
        } else if (type === "storage") {
            $(".info-div").hide();
        } else if (type === "player") {
            $(".info-div").show();
        } else if (type === "shop") {
            $(".info-div").show();
        }

        $(".ui").fadeIn();
    } else if (event.data.action == "hide") {
        $("#dialog").dialog("close");
        $(".ui").fadeOut();
        $(".item").remove();
        $("#otherInventory").html("<div id=\"noSecondInventoryMessage\"></div>");
        $("#noSecondInventoryMessage").html("Second inventory is not available");
        $("#playerInfo").hide();
        $("#otherInfo").hide();
    } else if (event.data.action == "setType") {
        type = event.data.type;
    } else if (event.data.action == "setItems") {
        inventorySetup(event.data.itemList, event.data.weight, event.data.maxWeight);
    } else if (event.data.action == "setSecondInventoryItems") {
        secondInventorySetup(event.data.itemList, event.data.weight, event.data.maxWeight);
    } else if (event.data.action == "setInfoText") {
        $(".info-div").html(event.data.text);
    } else if (event.data.action == "nearPlayers") {
        $("#nearPlayers").html("");

        $.each(event.data.players, function (index, player) {
            $("#nearPlayers").append('<button class="nearbyPlayerButton" data-player="' + player.player + '">ID ' + player.player + '</button>');
        });

        $("#dialog").dialog("open");

        $(".nearbyPlayerButton").click(function () {
            $("#dialog").dialog("close");
            player = $(this).data("player");
            $.post("http://vrp_inventoryhud/GiveItem", JSON.stringify({
                player: player,
                item: event.data.item,
                number: parseInt($("#count").val())
            }));
        });
    }

    $('.item').draggable({
        helper: 'clone',
        appendTo: 'body',
        zIndex: 99999,
        revert: 'invalid',
        start: function (event, ui) {
            if (disabled) {
                $(this).stop();
                return;
            }

            itemData = $(this).data("item");
            $("#description").show();
            $("#description").html(itemData.description);

            $(this).css('background-image', 'none');
            itemInventory = $(this).data("inventory");

            if (itemInventory == "second") {
                $("#drop").addClass("disabled");
                $("#give").addClass("disabled");
                $("#use").addClass("disabled");
            }
        },
        stop: function () {
            itemData = $(this).data("item");
            $("#description").hide();

            if (itemData !== undefined && itemData.name !== undefined) {
                image = setImage(itemData);
                $(this).css('background-image', 'url(\'img/' + image + '.png\'');
                $("#drop").removeClass("disabled");
                $("#use").removeClass("disabled");
                $("#give").removeClass("disabled");
            }
        }
    });
});

function closeInventory() {
    $.post("http://vrp_inventoryhud/NUIFocusOff", JSON.stringify({
        type: type
    }));
}

function inventorySetup(items, weight, maxWeight) {
    $("#playerInventory").html("");
    $("#playerInfo").html(weight + "/" + maxWeight + " KG");
    $("#playerInfo").show();
    $.each(items, function (index, item) {
        count = setCount(item, false);
        image = setImage(item);

        $("#playerInventory").append('<div class="slot"><div id="item-' + index + '" class="item" style = "background-image: url(\'img/' + image + '.png\')">' +
            '<div class="item-count">' + count + '</div> <div class="item-name">' + item.label + '</div> </div ><div class="item-name-bg"></div></div>');
        $('#item-' + index).data('item', item);
        $('#item-' + index).data('inventory', "main");
    });
}

function secondInventorySetup(items, weight, maxWeight) {
    $("#otherInventory").html("");
    $("#otherInfo").html(weight + "/" + maxWeight + " KG");
    $("#otherInfo").show();
    $.each(items, function (index, item) {
        count = setCount(item, true);
        image = setImage(item);

        $("#otherInventory").append('<div class="slot"><div id="itemOther-' + index + '" class="item" style = "background-image: url(\'img/' + image + '.png\')">' +
            '<div class="item-count">' + count + '</div> <div class="item-name">' + item.label + '</div> </div ><div class="item-name-bg"></div></div>');
        $('#itemOther-' + index).data('item', item);
        $('#itemOther-' + index).data('inventory', "second");
    });
}

function Interval(time) {
    var timer = false;
    this.start = function () {
        if (this.isRunning()) {
            clearInterval(timer);
            timer = false;
        }

        timer = setInterval(function () {
            disabled = false;
        }, time);
    };
    this.stop = function () {
        clearInterval(timer);
        timer = false;
    };
    this.isRunning = function () {
        return timer !== false;
    };
}

function disableInventory(ms) {
    disabled = true;

    if (disabledFunction === null) {
        disabledFunction = new Interval(ms);
        disabledFunction.start();
    } else {
        if (disabledFunction.isRunning()) {
            disabledFunction.stop();
        }

        disabledFunction.start();
    }
}

function setImage(item) {
    let image = item.name;
    let split = item.name.split("|");

    if (split[0] == "wbody") {
        image = split[1];
    } else if(split[0] == "wammo") {
        image = "ammo";
    }

    return image;
}

function setCount(item, second) {
    if (second && type === "shop") {
        return "$" + formatMoney(item.price);
    }

    count = item.count

    return count;
}

function formatMoney(n, c, d, t) {
    var c = isNaN(c = Math.abs(c)) ? 2 : c,
        d = d == undefined ? "." : d,
        t = t == undefined ? "," : t,
        s = n < 0 ? "-" : "",
        i = String(parseInt(n = Math.abs(Number(n) || 0).toFixed(c))),
        j = (j = i.length) > 3 ? j % 3 : 0;

    return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t);
};

$(document).ready(function () {
    $("#count").focus(function () {
        $(this).val("")
    }).blur(function () {
        if ($(this).val() == "") {
            $(this).val("1")
        }
    });

    $("body").on("keyup", function (key) {
        if (Config.closeKeys.includes(key.which)) {
            closeInventory();
        }
    });

    $('#use').droppable({
        hoverClass: 'hoverControl',
        drop: function (event, ui) {
            itemData = ui.draggable.data("item");

            if (itemData == undefined) {
                return;
            }

            itemInventory = ui.draggable.data("inventory");

            if (itemInventory == undefined || itemInventory == "second") {
                return;
            }

            disableInventory(300);
            $.post("http://vrp_inventoryhud/UseItem", JSON.stringify({
                item: itemData
            }));
        }
    });

    $('#playerInventory').on('dblclick', '.item', function () {
        itemData = $(this).data("item");

        if (itemData == undefined) {
            return;
        }

        itemInventory = $(this).data("inventory");

        if (itemInventory == undefined || itemInventory == "second") {
            return;
        }

        disableInventory(300);
        $.post("http://vrp_inventoryhud/UseItem", JSON.stringify({
            item: itemData
        }));
    });

    $('#give').droppable({
        hoverClass: 'hoverControl',
        drop: function (event, ui) {
            itemData = ui.draggable.data("item");

            if (itemData == undefined) {
                return;
            }

            itemInventory = ui.draggable.data("inventory");

            if (itemInventory == undefined || itemInventory == "second") {
                return;
            }

            disableInventory(300);
            // $.post("http://vrp_inventoryhud/GetNearPlayers", JSON.stringify({
            //     item: itemData
            // }));
            $.post("http://vrp_inventoryhud/GiveItem", JSON.stringify({
                item: itemData,
                number: parseInt($("#count").val())
            }));
        }
    });

    $('#drop').droppable({
        hoverClass: 'hoverControl',
        drop: function (event, ui) {
            itemData = ui.draggable.data("item");

            if (itemData == undefined) {
                return;
            }

            itemInventory = ui.draggable.data("inventory");

            if (itemInventory == undefined || itemInventory == "second") {
                return;
            }

            disableInventory(300);
            $.post("http://vrp_inventoryhud/DropItem", JSON.stringify({
                item: itemData,
                number: parseInt($("#count").val())
            }));
        }
    });

    $('#playerInventory').droppable({
        drop: function (event, ui) {
            itemData = ui.draggable.data("item");
            itemInventory = ui.draggable.data("inventory");

            if (type === "trunk" && itemInventory === "second") {
                disableInventory(500);
                $.post("http://vrp_inventoryhud/TakeFromTrunk", JSON.stringify({
                    item: itemData,
                    number: parseInt($("#count").val())
                }));
            } else if (type === "shop" && itemInventory === "second") {
                disableInventory(500);
                $.post("http://vrp_inventoryhud/BuyItem", JSON.stringify({
                    item: itemData,
                    number: parseInt($("#count").val())
                }));
            } else if (type === "chest" && itemInventory === "second") {
                disableInventory(500);
                $.post("http://vrp_inventoryhud/TakeFromChest", JSON.stringify({
                    item: itemData,
                    number: parseInt($("#count").val())
                }));
            } else if (type === "player" && itemInventory === "second") {
                disableInventory(500);
                $.post("http://vrp_inventoryhud/TakeFromPlayer", JSON.stringify({
                    item: itemData,
                    number: parseInt($("#count").val())
                }));
            }
        }
    });

    $('#otherInventory').droppable({
        drop: function (event, ui) {
            itemData = ui.draggable.data("item");
            itemInventory = ui.draggable.data("inventory");

            if (type === "trunk" && itemInventory === "main") {
                disableInventory(500);
                $.post("http://vrp_inventoryhud/PutIntoTrunk", JSON.stringify({
                    item: itemData,
                    number: parseInt($("#count").val())
                }));
            } else if (type === "chest" && itemInventory === "main") {
                disableInventory(500);
                $.post("http://vrp_inventoryhud/PutIntoChest", JSON.stringify({
                    item: itemData,
                    number: parseInt($("#count").val())
                }));
            } else if (type === "player" && itemInventory === "main") {
                disableInventory(500);
                $.post("http://vrp_inventoryhud/PutIntoPlayer", JSON.stringify({
                    item: itemData,
                    number: parseInt($("#count").val())
                }));
            }
        }
    });

    $("#count").on("keypress keyup blur", function (event) {
        $(this).val($(this).val().replace(/[^\d].+/, ""));
        if ((event.which < 48 || event.which > 57)) {
            event.preventDefault();
        }
    });
});

$.widget('ui.dialog', $.ui.dialog, {
    options: {
        // Determine if clicking outside the dialog shall close it
        clickOutside: false,
        // Element (id or class) that triggers the dialog opening 
        clickOutsideTrigger: ''
    },
    open: function () {
        var clickOutsideTriggerEl = $(this.options.clickOutsideTrigger),
            that = this;
        if (this.options.clickOutside) {
            // Add document wide click handler for the current dialog namespace
            $(document).on('click.ui.dialogClickOutside' + that.eventNamespace, function (event) {
                var $target = $(event.target);
                if ($target.closest($(clickOutsideTriggerEl)).length === 0 &&
                    $target.closest($(that.uiDialog)).length === 0) {
                    that.close();
                }
            });
        }
        // Invoke parent open method
        this._super();
    },
    close: function () {
        // Remove document wide click handler for the current dialog
        $(document).off('click.ui.dialogClickOutside' + this.eventNamespace);
        // Invoke parent close method 
        this._super();
    },
});