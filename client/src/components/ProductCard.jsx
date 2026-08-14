import { Link } from "react-router-dom";

export function StarRating({ rating }) {
  const rounded = Math.round(rating);

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={star <= rounded ? "text-amber-400" : "text-slate-300"}
          aria-hidden="true"
        >
          ★
        </span>
      ))}
      <span className="ml-1 text-xs text-slate-500">{rating.toFixed(1)}</span>
    </div>
  );
}

function ProductCard({ product }) {
  return (
    <Link
      to={`/product/${product.id}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="aspect-square overflow-hidden bg-slate-100">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-teal-100 to-slate-200 text-3xl font-semibold text-teal-800">
            {product.name.charAt(0)}
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3 text-left">
        <h3 className="line-clamp-2 text-sm font-medium text-slate-900">{product.name}</h3>
        <StarRating rating={product.rating} />
        <p className="mt-auto pt-1 text-base font-semibold text-teal-800">
          ${product.price.toFixed(2)}
        </p>
      </div>
    </Link>
  );
}

export default ProductCard;
