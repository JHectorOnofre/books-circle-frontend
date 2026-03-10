window.clubsViewModel = function (params) {
    var self = this;

    self.clubs = ko.observableArray();

    self.newClubName = ko.observable('');
    self.newClubGenre = ko.observable('');
    self.newClubDescription = ko.observable('');

    self.fetchClubs = async function () {
        console.log('fetch clubs');
        var response = await window.api.getClubs();
        self.clubs($.map(response, function (item) {
            return {
                name: ko.observable(item.name),
                genre: ko.observable(item.genre),
                description: ko.observable(item.description),
                id: ko.observable(item.id),
                memberCount: ko.observable(100) // TODO: get from api
            };
        }));
    };

    
    self.createClub = async function () {
        console.log('create club');
        var response = await window.api.createClub({
            name: self.newClubName(),
            genre: self.newClubGenre(),
            description: self.newClubDescription()
        });
        self.clubs.push({
            name: ko.observable(response.name),
            genre: ko.observable(response.genre),
            description: ko.observable(response.description),
            id: ko.observable(response.id),
            memberCount: ko.observable(100) // TODO: get from api
        });

        var modalEl = document.getElementById('createClubModal');
        var modal = bootstrap.Modal.getInstance(modalEl);
        if (modal) modal.hide();

        self.newClubName('');
        self.newClubGenre('');
        self.newClubDescription('');

    };

    self.init = function () {
        self.fetchClubs();
    };

    self.init();
};
