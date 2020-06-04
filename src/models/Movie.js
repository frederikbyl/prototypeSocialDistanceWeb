var _ = require('lodash');

function Movie(_node) {
  _.extend(this, _node);

  if (this.badgeId) {
    this.badgeId = this.badgeId;
  }
  if (this.timeOfLastKnownLocation) {
    this.timeOfLastKnownLocation = new Date(this.timeOfLastKnownLocation);
  }
  if (this.location) {
    this.location = this.location;
  }
}

module.exports = Movie;
