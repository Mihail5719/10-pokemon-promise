'use strict';

// ---------- DOM ----------
const form = document.getElementById('form');
const input = document.getElementById('pokemon-input');
const card = document.getElementById('card');

// ---------- Универсальная обёртка над fetch ----------
// Возвращает JSON-данные ИЛИ бросает ошибку, которая долетит до .catch()
function fetchJson(url) {
  return fetch(url).then(function (response) {
    if (!response.ok) {
      throw new Error('HTTP ' + response.status);
    }
    return response.json();
  });
}

// ---------- Управление интерфейсом ----------
function showLoading() {
  card.innerHTML = '<div class="spinner"></div>';
}

function showError(message) {
  console.error('Ошибка:', message);
  card.innerHTML = '<p class="error">❌ ' + message + '</p>';
}

function renderCard(pokemon, abilityName, description) {
  const sprite =
    pokemon.sprites.other['official-artwork'].front_default ||
    pokemon.sprites.front_default;

  card.innerHTML =
    '\
    <div class="pokemon-header">\
      <img src="' +
    sprite +
    '" alt="' +
    pokemon.name +
    '">\
      <h2>' +
    pokemon.name +
    '</h2>\
    </div>\
    <div class="ability-name">Ability: ' +
    abilityName +
    '</div>\
    <p class="description">' +
    description +
    '</p>\
  ';
}

// ---------- Основная логика: цепочка промисов ----------
function loadPokemonAbility(pokemonName) {
  const pokemonUrl =
    'https://pokeapi.co/api/v2/pokemon/' + pokemonName.toLowerCase();

  // Шаг 1: получаем данные покемона
  return fetchJson(pokemonUrl)
    .then(function (pokemon) {
      const abilityUrl = pokemon.abilities[0].ability.url;

      // Шаг 2: возвращаем промис со способностью — цепочка его "развернёт"
      // вместе с самим pokemon, чтобы передать его дальше
      return fetchJson(abilityUrl).then(function (ability) {
        return { pokemon: pokemon, ability: ability };
      });
    })
    .then(function (data) {
      // Шаг 3: находим описание на английском
      const enEntry = data.ability.effect_entries.find(function (entry) {
        return entry.language.name === 'en';
      });

      if (!enEntry) {
        throw new Error('описание умения на английском не найдено');
      }

      // Обязательный вывод в консоль (по ТЗ из старого задания)
      console.log(enEntry.effect);

      // Визуализация
      renderCard(data.pokemon, data.ability.name, enEntry.effect);
    });
}

// ---------- Обработка отправки формы ----------
form.addEventListener('submit', function (event) {
  event.preventDefault();

  const name = input.value.trim();
  if (!name) return;

  showLoading();

  loadPokemonAbility(name).catch(function (error) {
    // Ловим ВСЕ ошибки цепочки: сеть, HTTP 404, JSON, поиск описания
    showError(error.message || 'неизвестная ошибка');
  });
});

// Автоматическая загрузка при открытии страницы (как в старом варианте)
loadPokemonAbility('ditto').catch(function (error) {
  showError(error.message || 'неизвестная ошибка');
});
