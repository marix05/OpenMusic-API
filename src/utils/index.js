const mapDBToModel = {
    albums: ({ id, name, year, songs }) => ({
        id,
        name,
        year,
        songs,
    }),

    songs: ({ id, title, performer }) => ({
        id,
        title,
        performer,
    }),

    songById: ({ id, title, year, performer, genre, duration, album_id }) => ({
        id,
        title,
        year,
        performer,
        genre,
        duration,
        albumId: album_id,
    }),
};

module.exports = { mapDBToModel };
