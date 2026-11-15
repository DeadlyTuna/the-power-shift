import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, ChevronDown, ChevronRight } from "lucide-react";
import { getProduct, products, shipping, type Product } from "@/content/merch";
import { Section } from "@/components/ui/Layout";
import { JsonLd } from "@/components/shared/JsonLd";
import { AddToCart } from "@/components/merch/AddToCart";
import { Price } from "@/components/merch/Price";
import { ProductArt } from "@/components/merch/ProductArt";
import { ProductCard } from "@/components/merch/ProductCard";
import { ShippingNotes } from "@/components/merch/ShippingNotes";
import { formatINR } from "@/lib/format";
import { breadcrumbJsonLd, pageMetadata, productJsonLd } from "@/lib/seo";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) return { title: "Product not found", robots: { index: false } };
  return pageMetadata({
    title: product.name,
    description: `${product.tagline}. ${product.description}`,
    path: `/merch/${product.slug}`,
  });
}

/** Same category first, then the rest; in-stock items before out-of-stock ones. */
function relatedProducts(product: Product, limit = 3): Product[] {
  const others = products.filter((p) => p.slug !== product.slug);
  const score = (p: Product) => (p.category === product.category ? 0 : 1) + (p.inStock ? 0 : 2);
  return [...others].sort((a, b) => score(a) - score(b)).slice(0, limit);
}

export default async function ProductPage({ params }: Params) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();

  const related = relatedProducts(product);
  const path = `/merch/${product.slug}`;

  return (
    <>
      <JsonLd data={productJsonLd(product)} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Merch", path: "/merch" },
          { name: product.name, path },
        ])}
      />

      <Section tone="paper" className="pt-5 pb-16 md:pt-8 md:pb-24">
        <nav aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-1 text-[0.9375rem] text-muted">
            <li>
              <Link href="/merch" className="inline-flex min-h-11 items-center underline-offset-4 hover:text-jamun-900 hover:underline">
                Merch
              </Link>
            </li>
            <li aria-hidden="true">
              <ChevronRight className="size-4" />
            </li>
            <li aria-current="page" className="text-jamun-900">
              {product.name}
            </li>
          </ol>
        </nav>

        <div className="mt-3 grid gap-8 md:mt-6 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="mx-auto max-w-[18rem] overflow-hidden rounded-card border border-line sm:max-w-md lg:max-w-none">
              <ProductArt
                product={product}
                label={`${product.name}${product.printText ? `, printed with “${product.printText}”` : ""}`}
                sizes="(min-width: 1024px) 560px, (min-width: 640px) 448px, 288px"
                priority
              />
            </div>
          </div>

          <div>
            <p className="eyebrow text-marigold-700">{product.category}</p>
            <h1 className="display-lg mt-3">{product.name}</h1>
            <p className="lede mt-3 text-muted">{product.tagline}</p>

            <div className="mt-6">
              <Price price={product.price} compareAt={product.compareAt} size="lg" />
              <p className="mt-2 text-sm text-muted">
                Inclusive of all taxes. Free shipping on orders of {formatINR(shipping.freeAbove)} or more.
              </p>
            </div>

            <AddToCart product={product} className="mt-8" />

            <div className="mt-10 border-t border-line pt-8">
              <h2 className="display-sm">About it</h2>
              <p className="mt-3 max-w-prose">{product.description}</p>
              {product.details.length ? (
                <ul className="mt-5 flex flex-col gap-2.5">
                  {product.details.map((detail) => (
                    <li key={detail} className="flex items-start gap-2.5">
                      <Check aria-hidden="true" className="mt-1 size-4 shrink-0 text-peacock-600" />
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>

            <details className="group mt-8 border-y border-line">
              <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 font-semibold text-jamun-900 [&::-webkit-details-marker]:hidden">
                Shipping &amp; returns
                <ChevronDown
                  aria-hidden="true"
                  className="size-5 shrink-0 transition-transform duration-200 group-open:rotate-180"
                />
              </summary>
              <div className="pt-2 pb-6">
                <ShippingNotes layout="list" />
              </div>
            </details>
          </div>
        </div>
      </Section>

      {related.length ? (
        <Section tone="white" aria-labelledby="related-heading">
          <h2 id="related-heading" className="display-md">
            You might also like
          </h2>
          <ul className="mt-8 grid grid-cols-2 gap-x-3.5 gap-y-5 sm:gap-x-6 sm:gap-y-8 lg:grid-cols-3">
            {related.map((p, i) => (
              <li key={p.slug} className={i === 2 ? "hidden lg:block" : undefined}>
                <ProductCard product={p} />
              </li>
            ))}
          </ul>
        </Section>
      ) : null}
    </>
  );
}
