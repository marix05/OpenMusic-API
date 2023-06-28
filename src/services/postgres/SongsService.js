const { Pool } = require("pg");
const { nanoid } = require("nanoid");
const { mapDBToModel } = require("../../utils");
const InvariantError = require("../../exceptions/InvariantError");
const NotFoundError = require("../../exceptions/NotFoundError");

class SongsService {
    constructor() {
        this._pool = new Pool();
    }

    async addSong({ title, year, performer, genre, duration, albumId }) {
        const id = "song-".concat(nanoid(16));

        const query = {
            text: "INSERT INTO songs VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING id",
            values: [id, title, year, performer, genre, duration, albumId],
        };

        const result = await this._pool.query(query);

        if (!result.rows[0].id) {
            throw new InvariantError("Gagal menambahkan Lagu");
        }

        return result.rows[0].id;
    }

    async getSongs({ title, performer, albumId }) {
        const query = {
            text: "SELECT id, title, performer FROM songs",
        };

        let queryRequest = [];

        if (title) {
            queryRequest.push(`lower(title) like lower('%${title}%')`);
        }
        if (performer) {
            queryRequest.push(`lower(performer) like lower('%${performer}%')`);
        }
        if (albumId) {
            queryRequest.push(`album_id = ${albumId}'`);
        }

        if (queryRequest.length > 0) {
            query.text += ` WHERE ${queryRequest.join(" AND ")}`;
        }

        const result = await this._pool.query(query);

        return result.rows.map(mapDBToModel.songs);
    }

    async getSongById(id) {
        const query = {
            text: "SELECT * FROM songs WHERE id = $1",
            values: [id],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new NotFoundError("Lagu tidak ditemukan");
        }

        return result.rows.map(mapDBToModel.songById)[0];
    }

    async editSongById(
        id,
        { title, year, performer, genre, duration, albumId }
    ) {
        const query = {
            text: "UPDATE songs SET title = $1, year = $2, performer = $3, genre = $4, duration = $5, album_id = $6 WHERE id = $7 RETURNING id",
            values: [title, year, performer, genre, duration, albumId, id],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new NotFoundError(
                "Gagal memperbaharui lagu. Id tidak ditemukan"
            );
        }
    }

    async deleteSongById(id) {
        const query = {
            text: "DELETE FROM songs WHERE id = $1 RETURNING id",
            values: [id],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new NotFoundError("Lagu gagal dihapus. Id tidak ditemukan");
        }
    }
}

module.exports = SongsService;
