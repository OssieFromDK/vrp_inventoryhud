vRPin = {}
Tunnel.bindInterface("vrp_inventoryhud",vRPin)
vRPserver = Tunnel.getInterface("vRP","vrp_inventoryhud")
INserver = Tunnel.getInterface("vrp_inventoryhud","vrp_inventoryhud")
vRP = Proxy.getInterface("vRP")

local isInInventory = false

RegisterCommand('inventory',function()
    if not vRP.isInComa() and not vRP.isHandcuffed() then
        local playerId = PlayerId()
        local playerSource = GetPlayerServerId(playerId)
        INserver.inventoryOpened({playerSource})
    end
end)
RegisterKeyMapping('inventory', 'Open Inventory', 'keyboard', 'F1')

for i=1, 5 do 
    RegisterCommand('slot' .. i,function()
        INserver.useHotbarItem({i})
    end)
    RegisterKeyMapping('slot' .. i, 'Uses the item in slot ' .. i, 'keyboard', i)
end

RegisterCommand('hotbar',function()
    local playerId = PlayerId()
    local playerSource = GetPlayerServerId(playerId)
    INserver.getHotbarItems({playerSource}, function(hotbarItems)
        SendNUIMessage({
            action = "showHotbar",
            hotbarItems = hotbarItems
        })
    end)
end)
RegisterKeyMapping('hotbar', 'Check your hotbar items', 'keyboard', 'TAB')

function vRPin.openInventory(type)
    vRPin.loadPlayerInventory()
    isInInventory = true
    SendNUIMessage({
        action = "display",
        type = type 
    })
    SetNuiFocus(true, true)
end

function closeInventory()
    isInInventory = false
    SendNUIMessage({
        action = "hide"
    })
    SetNuiFocus(false, false)
    INserver.closeInventory()
end

RegisterNUICallback("NUIFocusOff", function(data, cb)
    closeInventory()
    cb("ok")
end)

RegisterNUICallback("UseItem", function(data, cb)
    INserver.requestItemUse({data.item.name})
    cb("ok")
end)

RegisterNUICallback("DropItem", function(data, cb)
    if IsPedSittingInAnyVehicle(PlayerPedId()) then return end
    if type(data.number) == "number" and math.floor(data.number) == data.number then
        INserver.requestItemDrop({data.item.name, tonumber(data.number)})
    end
    cb("ok")
end)

RegisterNUICallback("GiveItem", function(data, cb)
    INserver.requestItemGive({data.item.name, tonumber(data.number)})
    cb("ok")
end)

RegisterNUICallback("PutIntoHotbar", function(data, cb)
    INserver.requestPutHotbar({data.item.name, tonumber(data.number), tonumber(data.slot), data.from})
    cb("ok")
end)

RegisterNUICallback("TakeFromHotbar", function(data, cb)
    INserver.requestRemoveHotbar({tonumber(data.slot)})
    cb("ok")
end)

function vRPin.loadPlayerInventory()
    local playerId = PlayerId()
    local playerSource = GetPlayerServerId(playerId)
    INserver.getInventoryItems({playerSource}, function(items, hotbarItems, weight, maxWeight)
        SendNUIMessage({
            action = "setItems",
            itemList = items,
            hotbarItems = hotbarItems,
            weight = weight,
            maxWeight = maxWeight
        })
    end)
end

function vRPin.setSecondInventoryItems(items, weight, maxWeight)
    SendNUIMessage({
        action = "setSecondInventoryItems",
        itemList = items,
        weight = weight,
        maxWeight = maxWeight
    })
end

Citizen.CreateThread(function()
    while true do
        Citizen.Wait(1)
        DisableControlAction(0, 37, true) -- TAB
        if isInInventory then
            DisableAllControlActions(0)
        end
    end
end)