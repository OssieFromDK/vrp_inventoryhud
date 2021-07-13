fx_version "bodacious"
games { 'gta5' }

ui_page 'html/ui.html'

client_scripts {
  "lib/Tunnel.lua",
  "lib/Proxy.lua",
  'config.lua',
  'client/main.lua',
  'client/chest.lua',
  'client/drops.lua'
}

server_scripts {
  "@vrp/lib/utils.lua",
  'config.lua',	
  'server/main.lua',
  'server/chest.lua',
  'server/drops.lua'
}

files {
  'html/ui.html',
  'html/css/ui.css',
  'html/css/jquery-ui.css',
  'html/js/inventory.js',
  'html/js/config.js',
  -- JS LOCALES
  'html/locales/cs.js',
  'html/locales/en.js',
  'html/locales/fr.js',
  -- ICONS
  'html/img/*.png'
} --'html/img/.png',
