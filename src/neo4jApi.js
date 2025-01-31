require('file?name=[name].[ext]!../node_modules/neo4j-driver/lib/browser/neo4j-web.min.js');
var Movie = require('./models/Movie');
var MovieCast = require('./models/MovieCast');
var _ = require('lodash');

var neo4j = window.neo4j.v1;
var driver = neo4j.driver("bolt://localhost", neo4j.auth.basic("neo4j", "socialDistance"));

function searchMovies(queryString) {
  var session = driver.session();
  return session
    .run(
      'MATCH (badge:Badge)--(location:Location) \
      RETURN badge, location order by badge.timeOfLastKnownLocation desc',
      {title: '(?i).*' + queryString + '.*'}
    )
    .then(result => {
      session.close();
      return result.records.map(record => {
        //console.log(record.get('location').properties.name)
        var badge = { 
          badgeId : record.get('badge').properties.badgeId,
          uuid:  record.get('badge').properties.uuid,
          timeOfLastKnownLocation : record.get('badge').properties.timeOfLastKnownLocation,
          location : record.get('location').properties.name
        };
        
        return new Movie(badge);
      });
    })
    .catch(error => {
      session.close();
      throw error;
    });
}


function getGraph() {
  var session = driver.session();
  return session.run(
    'MATCH (m:Badge)-[:ENCOUNTERED]->(a:Badge) \
    RETURN distinct m.badgeId AS badgeId, collect(a.badgeId) AS cast ', {limit: 100})
    .then(results => {
      session.close();
      var nodes = [], rels = [], i = 0;
      results.records.forEach(res => {
        var existsAlready = _.findIndex(nodes, {badgeId: res.get('badgeId'), label: 'badgeId'});
        console.log(existsAlready);
        var target = i;
        if (existsAlready == -1) {
          nodes.push({badgeId: res.get('badgeId'), label: 'badgeId'});
          target = i;
          i++; 
        } else {
          target = existsAlready;
        }

        res.get('cast').forEach(name => {
          console.log(name);
          var badge = {badgeId: name, label: 'badgeId'};
          var source = _.findIndex(nodes, badge);
          console.log(source);
          if (source == -1) {
            nodes.push(badge);
            source = i;
            i++;
          }
          rels.push({source, target})
        })
      });

      return {nodes, links: rels};
    });
}

exports.searchMovies = searchMovies;
exports.getGraph = getGraph;

