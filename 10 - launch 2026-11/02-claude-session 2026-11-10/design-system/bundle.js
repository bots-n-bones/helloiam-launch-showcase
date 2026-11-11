/* helloiam.am — fills object slots in the post templates. */
window.HelloIAm = (function () {
  var names = {"01": "Lavash", "02": "Khorovats", "03": "Glass of Armenian wine", "04": "Matsun", "05": "Bottle of Armenian wine", "06": "Cup of Armenian coffee", "07": "Pomegranate", "08": "Apricot", "09": "Tolma", "10": "Green Plate", "11": "Grapes", "12": "Matnakash", "13": "Baklava", "14": "Sujukh", "15": "Basturma", "16": "Gata", "17": "Basket of fruit", "18": "Zhingyalov hats", "19": "Wedding dress", "20": "Dhol", "21": "Backgammon", "22": "Duduk", "23": "A bucket of water", "24": "Church", "25": "Carpet", "26": "Khachkar", "27": "Pulpulak", "28": "Gyumri", "29": "Garni tample", "30": "Geghard Monastery", "31": "Tatev Monastery", "32": "Jermuk water", "33": "Mountain", "34": "Ararat", "35": "Sevan trout", "36": "Street lamp", "37": "Balcony", "38": "Brutalism", "39": "Sun", "40": "Map", "41": "Jazve", "42": "Jug", "43": "Backpack", "44": "Tuf", "45": "Armenian passport", "46": "Fountains", "47": "Tashi Tushi (dancing man)", "48": "Armenian car", "49": "Restaurant plate", "50": "Ghapama"};
  var emoji = {"01": "1238ca17f8fe7e8f7425cf971aab946b", "02": "c30f42be8822f6ea18c7875e8c3483fc", "03": "cefa1cefa2f696ffc1a2aa59b3cfe3b7", "04": "08a6c0756988c3e47122e05b7f85cf4c", "05": "0fa55721f116e7fb6ccd7a46ef0fa764", "06": "6761a3fad580b9c68c0a941deabed0fd", "07": "1360a1260289c6e3572029b2ad6cd28c", "08": "e0a85ac20bf41a84db63289128acaa82", "09": "a8804a34d5f421a9123a906daef1710f", "10": "6592d4f01c3a3a20dbacd8c0ae2afa9e", "11": "b263e77f1a1fbb822f8a68b065808fbf", "12": "99ab9a308b995454e58f8544998d4db2", "13": "aaaee029ffcfb6111aa883126c7a1cb0", "14": "009554440fbe02c28c8c8beaaa5ef1cf", "15": "ac35182fe27b58377d0a35e6f6224715", "16": "a21e4623bee1aa7283e3ddde9d19c5f3", "17": "b4bcea9bf8fbcaeac6d379fe7e0f353f", "18": "ef72f87454edf168af961363153f72ea", "19": "0d49ce0a27b4279c7837259579dc7431", "20": "88119eb090a92b3839359c5346298114", "21": "8baf5e8b21502e9e56d60f09b212a395", "22": "f0865b50fb68cabf8411a5f57cfed295", "23": "9a629f2247f6760dc076997bb6c0fa52", "24": "9dcfe2f1fb47207e902cdc70a785295b", "25": "6ddfd1afc6a9aa53ee495a9294758c54", "26": "85dfbe8284f1a97ff4364d5ee06d7856", "27": "57530649634db1d3c08bd4999ec285ed", "28": "a5bfec6b9161b8e2e092e8af3ba1c3eb", "29": "9bcfdc94a003bf58cc6a73a035cc8979", "30": "9ad307a2356080f09cb6e5d5fef473bc", "31": "ac686fd3586019bf0890434a0b73fe22", "32": "fd0cba4cc79b4cd43153c107c4898cdb", "33": "62d86afd9c69cbf0ab7335ab7a26eaea", "34": "b01d4b799d07b7a9b4988333523e0fa2", "35": "f1aaa500cc6539a2cd975525a88455f9", "36": "47ad4ecf8fb700d5a64eef795c993d8a", "37": "cce29ec4d209a5c56fb8f86bdebc54e4", "38": "4d825a10ee3c41369dd0ea83dc50bf89", "39": "d5d5a036a29805030d7174981cf4b3d2", "40": "053962627cb2b86e42c18cc840ef66cc", "41": "cc1f8455d91ae00755879d9d65cdb6c0", "42": "06e4c7a37f2f0364bd33202ebd31b9b4", "43": "a7aa63e5eda72282eefb474340172b4f", "44": "ed182e10e7e30fc6db35e715fa43b707", "45": "f4f36442fe32f703dd13e94bc508a65e", "46": "0560dd44b73afa3d686b0e8478dbfccf", "47": "ab35ede15af308a222d8f402f7376641", "48": "8ad183a93a834f6b0f3a2251bd475e07", "49": "c8f139ca5ec6dd807928e316b14ed298", "50": "606d3f174118ea9598d7ebeda5f582e9"};
  var media = {};
  function mount(root) {
    root = root || document;
    root.querySelectorAll('[data-e]').forEach(function (el) {
      var n = el.getAttribute('data-e'), id = emoji[n];
      el.textContent = '';
      if (id) {
        var img = document.createElement('img');
        img.src = '/_blob/' + id; img.alt = names[n] || '';
        el.appendChild(img);
      } else {
        el.classList.add('is-empty');
        var s = document.createElement('span');
        s.textContent = (el.classList.contains('obj') || el.classList.contains('ctr')) ? n + ' ' + (names[n] || '') : n;
        el.appendChild(s);
      }
    });
    root.querySelectorAll('[data-m]').forEach(function (el) {
      var id = media[el.getAttribute('data-m')];
      if (!id) return;
      var img = document.createElement('img');
      img.className = 'media'; img.src = '/_blob/' + id; img.alt = '';
      el.insertBefore(img, el.firstChild); el.classList.add('has-media');
    });
  }
  return { names: names, emoji: emoji, media: media, mount: mount };
})();
