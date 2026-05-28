import { motion } from 'framer-motion';

const SkeletonCard = ({ index = 0 }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08, duration: 0.4 }}
            className="skeleton-card-shell"
        >
            <div className="glass-panel skeleton-card">
                {/* Image skeleton */}
                <div className="skeleton-cover skeleton-shimmer" />

                {/* Title skeleton */}
                <div className="skeleton-line skeleton-title skeleton-shimmer" />
                <div className="skeleton-line skeleton-title-short skeleton-shimmer" />

                {/* Author skeleton */}
                <div className="skeleton-line skeleton-author skeleton-shimmer" />

                {/* Description skeleton */}
                <div className="skeleton-description">
                    <div className="skeleton-line skeleton-full skeleton-shimmer" />
                    <div className="skeleton-line skeleton-wide skeleton-shimmer" />
                    <div className="skeleton-line skeleton-medium skeleton-shimmer" />
                </div>

                {/* Footer skeleton */}
                <div className="skeleton-footer">
                    <div className="skeleton-line skeleton-footer-line skeleton-shimmer" />
                </div>
            </div>
        </motion.div>
    );
};

export default SkeletonCard;
