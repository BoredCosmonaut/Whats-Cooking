const db = require('../config/db');


async function addReview(user_id,recipe_id,rating,comment) {
    try {
        const result = await db.query(`
                    INSERT INTO reviews (user_id,recipe_id,rating,comment)
                    VALUES ($1,$2,$3,$4)
                    RETURNING *`, [user_id,recipe_id,rating,comment]);
        return result.rows[0];
    } catch (error) {
        console.error('Error while uploading review:',error);
    }
};


async function getReviewsByRecipe(recipe_id, user_id) {
  try {
    const result = await db.query(
      `SELECT 
          r.*, 
          u.username AS reviewer,
          COALESCE(
              json_agg(
                  DISTINCT jsonb_build_object(
                      'image_id', rg.gallery_id,
                      'image_name', rg.image_name,
                      'image_url', rg.image_url
                  )
              ) FILTER (WHERE rg.gallery_id IS NOT NULL), '[]'
          ) AS images,
          COALESCE(hc.helpful_count, 0) AS helpful_count,
          CASE 
              WHEN rh.user_id IS NOT NULL THEN true
              ELSE false
          END AS liked_by_user
       FROM reviews r
       JOIN users u ON r.user_id = u.user_id
       LEFT JOIN review_gallery rg ON r.review_id = rg.review_id
       LEFT JOIN review_helpful rh 
          ON r.review_id = rh.review_id AND rh.user_id = $2
       LEFT JOIN (
          SELECT review_id, COUNT(*) AS helpful_count
          FROM review_helpful
          GROUP BY review_id
       ) hc ON r.review_id = hc.review_id
       WHERE r.recipe_id = $1
       GROUP BY r.review_id, u.username, rh.user_id, hc.helpful_count
       ORDER BY r.created_at DESC`,
      [recipe_id, user_id]
    );

    return result.rows;
  } catch (error) {
    console.error("Error fetching reviews:", error);
    throw error;
  }
}

async function addReviewImage(review_id,image_name,image_url) {
    try {
        const result = await db.query(`
                    INSERT INTO review_gallery (review_id,image_name,image_url)
                    VALUES ($1,$2,$3)
                    RETURNING *`, [review_id,image_name,image_url]);
        return result.rows[0];
    } catch (error) {
        console.error('Error while adding image:',error);
    }
};

async function getReviewImages(review_id) {
    try {
        const result = await db.query(`
            SELECT * FROM review_gallery WHERE review_id = $1`, [review_id]);
        return result.rows
    } catch (error) {
        console.error('Error while adding review image:', error);
    }
};

async function removeReview(review_id,user_id,isAdmin) {
    try {
        let query;
        let params;

        if(isAdmin) {
            query = 'DELETE FROM reviews WHERE review_id = $1 RETURNING *';
            params = [review_id]; 
        } else {
            query ='DELETE FROM reviews WHERE review_id = $1 and user_id = $2 RETURNING *';
            params = [review_id,user_id];
        }

        const result = await db.query(query,params);

        return result.rows[0];
    } catch (error) {
        console.error('Error while deleting the review:',error);
    }
};

async function reportReview(review_id,user_id,reason) {
    try {
        const result = await db.query(`
                    INSERT INTO review_reports (review_id,reported_by,reason)
                    VALUES ($1,$2,$3)
                    ON CONFLICT (review_id, reported_by) DO NOTHING
                    RETURNING *`,[review_id,user_id,reason]);
        return result.rows;
    } catch (error) {
        console.error('Error while reporting a review:',error);
    }
};

async function getReviewById(review_id) {
    try {
        const result = await db.query('SELECT * FROM reviews WHERE review_id = $1', [review_id]);

        return result.rows[0];
    } catch (error) {
        console.error('Error while getting review info:',error);
    }
};

async function markReviewHelpful(review_id,user_id) {
    try {
        const result = await db.query(`
                INSERT INTO review_helpful (review_id,user_id)
                VALUES ($1,$2)
                ON CONFLICT DO NOTHING
                RETURNING *`, [review_id,user_id]);
        return result.rows;
    } catch (error) {
        console.error('Error while marking helpful:',error)
    }
};

async function getHelpfulCount(review_id) {
    try {
        const result = await db.query(`SELECT COUNT(*) AS helpful_count FROM review_helpful WHERE review_id = $1`, [review_id]);

        return parseInt(result.rows[0].helpful_count, 10);
    } catch (error) {
        console.error('Error fetching helpful count:', error);
    }
};

async function getReportedReviews() {
    try {
        const result = await db.query(`
            SELECT 
                rp.report_id,
                rp.review_id,
                rp.reason,
                rp.reported_by,
                rp.created_at AS report_created_at,
                r.comment AS review_comment,
                r.rating AS review_rating,
                r.user_id AS reviewer_id,
                reviewer.username AS reviewer_username,
                reporter.username AS reporter_username
            FROM review_reports rp
            JOIN reviews r ON rp.review_id = r.review_id
            JOIN users reviewer ON r.user_id = reviewer.user_id
            JOIN users reporter ON rp.reported_by = reporter.user_id
            ORDER BY rp.created_at DESC
        `);
        return result.rows;
    } catch (error) {
        console.error('Error while retrieving reported reviews:', error);
    }
};

async function removeLikeFromReview(user_id,review_id) {
    try {
        const result = await db.query(`DELETE FROM review_helpful WHERE user_id = $1 AND review_id = $2 RETURNING *`, [user_id,review_id]);

        return result.rows;
    } catch (error) {
        console.error('Error while removing like:',error);
    }
};



module.exports = {
    addReview,
    getReviewsByRecipe,
    addReviewImage,
    getReviewImages,
    removeReview,
    reportReview,
    getReviewById,
    markReviewHelpful,
    getHelpfulCount,
    getReportedReviews,
    removeLikeFromReview
}