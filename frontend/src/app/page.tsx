import { cookies } from "next/headers";
import ApartmentCardServer from "@/components/ApartmentCardServer";
import FiltersClient from "@/components/FiltersClient";
import { getApartments } from "@/services/api";
import { Apartment, Filters } from "@/types";
import styles from "./page.module.css";
import Link from "next/link";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const cookieStore = await cookies();
  const theme = cookieStore.get("theme")?.value || "light";

  // Параметры пагинации
  const page = typeof params?.page === "string" ? parseInt(params.page) : 1;
  const per_page = 12;

  // Параметры фильтрации
  const min_price =
    typeof params?.min_price === "string" ? params.min_price : undefined;
  const max_price =
    typeof params?.max_price === "string" ? params.max_price : undefined;
  const rooms = typeof params?.rooms === "string" ? params.rooms : undefined;
  const district =
    typeof params?.district === "string" ? params.district : undefined;
  const underground =
    typeof params?.underground === "string" ? params.underground : undefined;
  const min_area =
    typeof params?.min_area === "string" ? params.min_area : undefined;
  const max_area =
    typeof params?.max_area === "string" ? params.max_area : undefined;
  const author_type =
    typeof params?.author_type === "string" ? params.author_type : undefined;
  const has_photo = params?.has_photo === "true";
  const is_owner = params?.is_owner === "true";
  const sort_by =
    typeof params?.sort_by === "string" ? params.sort_by : "price_asc";

  // Формируем фильтры для API
  const apiFilters: Filters = {
    page,
    per_page,
    min_price: min_price ? parseInt(min_price) : undefined,
    max_price: max_price ? parseInt(max_price) : undefined,
    rooms: rooms,
    district: district,
    underground: underground,
    min_area: min_area ? parseFloat(min_area) : undefined,
    max_area: max_area ? parseFloat(max_area) : undefined,
    author_type: author_type,
    has_photo: has_photo || undefined,
    is_owner: is_owner || undefined,
    sort_by: sort_by,
  };

  // Удаляем undefined значения
  Object.keys(apiFilters).forEach((key) => {
    const k = key as keyof Filters;
    if (apiFilters[k] === undefined) {
      delete apiFilters[k];
    }
  });

  let apartments: Apartment[] = [];
  let total = 0;
  let pages = 1;

  try {
    const data = await getApartments(apiFilters);
    apartments = data.items;
    total = data.total;
    pages = data.pages;
  } catch (error) {
    console.error("Failed to fetch apartments:", error);
  }

  // Создаем массив страниц
  const pageNumbers = [];
  for (let i = 1; i <= pages; i++) {
    pageNumbers.push(i);
  }

  // Функция для построения URL с сохранением фильтров
  const getPageUrl = (pageNum: number) => {
    const urlParams = new URLSearchParams();

    if (min_price) urlParams.append("min_price", min_price);
    if (max_price) urlParams.append("max_price", max_price);
    if (rooms) urlParams.append("rooms", rooms);
    if (district) urlParams.append("district", district);
    if (underground) urlParams.append("underground", underground);
    if (min_area) urlParams.append("min_area", min_area);
    if (max_area) urlParams.append("max_area", max_area);
    if (author_type) urlParams.append("author_type", author_type);
    if (has_photo) urlParams.append("has_photo", "true");
    if (is_owner) urlParams.append("is_owner", "true");
    if (sort_by !== "price_asc") urlParams.append("sort_by", sort_by);

    urlParams.append("page", pageNum.toString());

    return `/?${urlParams.toString()}`;
  };

  return (
    <main className={styles.main}>
      <div className="container">
        <h1 className={styles.title}>Аренда квартир в Москве</h1>
        <p className={styles.subtitle}>Найдено {total} квартир</p>

        <FiltersClient
          initialFilters={{
            min_price,
            max_price,
            rooms,
            district,
            underground,
            min_area,
            max_area,
            author_type,
            has_photo,
            is_owner,
            sort_by,
          }}
        />

        <noscript>
          <div className={styles.noScriptMessage}>
            ⚠️ Для работы фильтров включите JavaScript
          </div>
        </noscript>

        {apartments.length === 0 ? (
          <div className={styles.noResults}>
            <span className={styles.noResultsIcon}>🏠</span>
            <h3>Квартиры не найдены</h3>
            <p>Попробуйте изменить параметры поиска</p>
          </div>
        ) : (
          <>
            <div className={styles.apartmentGrid}>
              {apartments.map((apt) => (
                <ApartmentCardServer key={apt.id} apartment={apt} />
              ))}
            </div>

            {pages > 1 && (
              <div className={styles.pagination}>
                {page > 1 && (
                  <Link href={getPageUrl(page - 1)} className={styles.pageLink}>
                    ←
                  </Link>
                )}

                {pageNumbers.map((num) => (
                  <Link
                    key={num}
                    href={getPageUrl(num)}
                    className={`${styles.pageLink} ${num === page ? styles.active : ""}`}
                  >
                    {num}
                  </Link>
                ))}

                {page < pages && (
                  <Link href={getPageUrl(page + 1)} className={styles.pageLink}>
                    →
                  </Link>
                )}
              </div>
            )}

            <div className={styles.resultsInfo}>
              Показано {apartments.length} из {total} квартир · Страница {page}{" "}
              из {pages}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
