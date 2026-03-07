window['club-detailViewModel'] = function (params) {
    var self = this;

    self.clubId = params.clubId;

    // Header properties
    self.clubName = ko.observable('Loading...');
    self.clubGenre = ko.observable('');
    self.clubDescription = ko.observable('');
    self.memberCount = ko.observable(0);

    // Status properties
    self.isMember = ko.observable(false);

    // Collection properties
    self.books = ko.observableArray();
    self.members = ko.observableArray();

    // Forms
    self.newBookTitle = ko.observable('');
    self.newBookAuthor = ko.observable('');

    // For progress
    self.updatingProgressValue = ko.observable(0);
    self.currentBookId = ko.observable();
    self.currentBookRef = ko.observable();

    self.loadClubInfo = async function () {
        $.blockUI({ message: null });
        try {
            const data = await window.api.getClub(self.clubId);
            self.clubName(data.name);
            self.clubGenre(data.genre || 'General');
            self.clubDescription(data.description);
            // mock member status for now based on response
            $.unblockUI();

            // Actually fetch books and members independently...
            self.fetchBooks();
        } catch (err) {
            console.error(err);
            $.unblockUI();
            if (err.message === 'Unauthorized') hasher.setHash('login');
        }
    };

    self.fetchBooks = async function () {
        try {
            const data = await window.api.getBooks(self.clubId);
            var mapped = $.map(data || [], function (item) {
                return {
                    id: ko.observable(item.id),
                    title: ko.observable(item.title),
                    author: ko.observable(item.author),
                    progress: ko.observable(item.progress || 0),
                    votes: ko.observable(item.votes || 0)
                };
            });
            self.books(mapped);
        } catch (err) {
            console.error(err);
        }
    };

    self.joinClub = function () {
        self.isMember(true);
        self.memberCount(self.memberCount() + 1);
        self.members.push({ username: ko.observable(app.currentUser()), role: ko.observable('Member') });
    };

    self.leaveClub = function () {
        self.isMember(false);
        self.memberCount(Math.max(0, self.memberCount() - 1));
        self.members.remove(function (item) { return item.username() === app.currentUser(); });
    };

    self.submitBookProposal = async function () {
        $.blockUI({ message: null });
        try {
            const data = await window.api.proposeBook(self.clubId, {
                clubId: self.clubId,
                title: self.newBookTitle(),
                author: self.newBookAuthor()
            });

            self.books.push({
                id: ko.observable(data.id),
                title: ko.observable(data.title),
                author: ko.observable(data.author),
                progress: ko.observable(0),
                votes: ko.observable(0)
            });
            self.newBookTitle('');
            self.newBookAuthor('');

            var modalEl = document.getElementById('proposeBookModal');
            var modal = bootstrap.Modal.getInstance(modalEl);
            if (modal) modal.hide();
            $.unblockUI();
        } catch (err) {
            console.error(err);
            $.unblockUI();
            alert("Error proposing book");
        }
    };

    self.voteForBook = function (book) {
        book.votes(book.votes() + 1);
        // We'd POST to API here if implemented
    };

    self.selectBookForProgress = function (book) {
        self.currentBookId(book.id());
        self.currentBookRef(book);
        self.updatingProgressValue(book.progress());
    };

    self.updateBookProgress = async function () {
        var p = parseInt(self.updatingProgressValue(), 10);
        if (p >= 0 && p <= 100) {
            try {
                await window.api.updateBookProgress(self.clubId, self.currentBookId(), p);
                self.currentBookRef().progress(p);
            } catch (e) {
                console.error("Error updating progress", e);
            }
            var modalEl = document.getElementById('updateProgressModal');
            var modal = bootstrap.Modal.getInstance(modalEl);
            if (modal) modal.hide();
        }
    };

    self.init = function () {
        self.loadClubInfo();
    };

    self.init();
};
