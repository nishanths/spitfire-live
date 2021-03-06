const merge = require('lodash').merge
const sortBy = require('lodash').sortBy
const sortByAll = require('lodash').sortByAll
const fs = require('fs');

const our_cmu_dict = JSON.parse(fs.readFileSync('our_cmu_dict').toString());

const map = {};

var numSylls = function(str) {
    return Math.max(0, str.split(/\s+/).length);
};

var ocd = Object.keys(our_cmu_dict).map(function(word) {
  return {
    word: word,
    pron: our_cmu_dict[word]['pronunciation'],
    partOfSpeech: our_cmu_dict[word]['partOfSpeech'],
    frequency: our_cmu_dict[word]['frequency'],
    coolness: our_cmu_dict[word]['frequency']*1 + numSylls(our_cmu_dict[word]['pronunciation'])*10000
  };
});

var countMatchingTrailingSyllablesInPronunciations = function(a, b) {
    a = a.split(' ').reverse();
    b = b.split(' ').reverse();
    var score = 0;
    var shorterPron = (a.length < b.length) ? a : b;

    for (var i in shorterPron) {
      if (a[i] === b[i]) {
        score++;
      } else {
        return score;
      }
    }

    return score;
};

ocd.forEach(function(obj) {
    var input = obj.word;
    console.log('working on input', input);
    if (!input) return []

    input = input.toLowerCase()

    var inputPron = obj.pron;
    var results = [];
      
    for (var i = 0; i < ocd.length; i += 1) {
        var obj2 = ocd[i];
        
        var score = countMatchingTrailingSyllablesInPronunciations(inputPron, obj2.pron)
        if (score > 1) {
            // console.log(results)
            results.push(merge(obj2, {score: score}))
        }
    }

    var results = sortByAll(results, ['score', 'coolness']);
    results.reverse();

    results = results.map(function(r) {
        return r.word;
    });

    map[input] = results;
});

fs.writeFileSync('map', JSON.stringify(map));
console.log(JSON.parse(fs.readFileSync('map').toString()));
