window.clubsViewModel = function (params) {
    var self = this;

    self.clubs = ko.observableArray();

    self.newClubName = ko.observable('');
    self.newClubGenre = ko.observable('');
    self.newClubDescription = ko.observable('');

    self.fetchClubs = async function () {

    };

    self.createClub = async function () {

    };

    self.init = function () {

    };

    self.init();
};
