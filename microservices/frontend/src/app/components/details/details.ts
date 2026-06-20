import { Subscription } from 'rxjs';

import { CommonModule, CurrencyPipe, Location } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { IProduct } from '../../models/iproduct';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart-service';
import { ProductService } from '../../services/product.service';
import { IReview, RatingService } from '../../services/rating-service';
import { StaticProducts } from '../../services/static-products';

@Component({
  selector: 'app-details',
  standalone: true,
  imports: [CurrencyPipe, CommonModule, RouterLink, FormsModule],
  templateUrl: './details.html',
  styleUrls: ['./details.css'],
})
export class Details implements OnInit, OnDestroy {
  currentId: string = '';
  product: IProduct | null = null;
  addedToCart: boolean = false;
  loading: boolean = true;

  idsArr: string[] = [];
  currentIdIndex: number = 0;

  // Reviews list
  reviews: IReview[] = [];
  reviewsLoading: boolean = false;

  // Submit new review
  ratingValue: number = 0;
  ratingComment: string = '';
  ratingSubmitting: boolean = false;
  ratingSuccess: string = '';
  ratingError: string = '';
  hoveredStar: number = 0;

  // Edit mode
  editingReviewId: string | null = null;
  editRatingValue: number = 0;
  editComment: string = '';
  editHoveredStar: number = 0;
  editSubmitting: boolean = false;
  editError: string = '';

  // Delete confirm
  deletingReviewId: string | null = null;

  private _routeSub!: Subscription;
  private _idsSub!: Subscription;

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private prdService: StaticProducts,
    private cartService: CartService,
    private location: Location,
    private router: Router,
    private ratingService: RatingService,
    private auth: AuthService,
  ) {}

  ngOnInit(): void {
    this._idsSub = this.prdService.products$.subscribe((products) => {
      this.idsArr = products.map((p) => p._id);
      this.currentIdIndex = this.idsArr.findIndex((id) => id === this.currentId);
    });

    this._routeSub = this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (!id) {
        this.loading = false;
        return;
      }
      this.currentId = id;
      this.currentIdIndex = this.idsArr.findIndex((id) => id === this.currentId);
      this.loading = true;
      this.product = null;
      this.resetRating();

      this.productService.getProductById(id).subscribe({
        next: (res) => {
          const p = res.data.product;
          this.product = { ...p, imgUrl: p.image, quantity: p.stock };
          this.addedToCart = this.cartService.isInCart(this.product._id);
          this.loading = false;
        },
        error: () => {
          this.product = null;
          this.loading = false;
        },
      });

      this.loadReviews(id);
    });
  }

  ngOnDestroy(): void {
    this._routeSub?.unsubscribe();
    this._idsSub?.unsubscribe();
  }

  // ── Helpers ────────────────────────────────────────
  get isLoggedIn(): boolean {
    return this.auth.isLoggedIn();
  }

  get currentUserId(): string {
    const u = this.auth.currentUser();
    return u?._id ?? String(u?.id ?? '');
  }

  isOwnReview(review: IReview): boolean {
    return review.userId?._id === this.currentUserId;
  }

  getStarArray(): number[] {
    return [1, 2, 3, 4, 5];
  }

  // ── Load reviews ───────────────────────────────────
  loadReviews(productId: string): void {
    this.reviewsLoading = true;
    this.ratingService.getProductRatings(productId).subscribe({
      next: (res) => {
        this.reviews = res.data.product.ratings;
        this.reviewsLoading = false;
      },
      error: () => {
        this.reviews = [];
        this.reviewsLoading = false;
      },
    });
  }

  // ── Submit new review ──────────────────────────────
  setRating(star: number): void {
    this.ratingValue = star;
  }
  hoverStar(star: number): void {
    this.hoveredStar = star;
  }
  clearHover(): void {
    this.hoveredStar = 0;
  }

  getStarClass(star: number, hovered: number, selected: number): string {
    return star <= (hovered || selected) ? 'star active' : 'star';
  }

  resetRating(): void {
    this.ratingValue = 0;
    this.ratingComment = '';
    this.ratingSuccess = '';
    this.ratingError = '';
    this.hoveredStar = 0;
  }

  submitRating(): void {
    if (!this.ratingValue) {
      this.ratingError = 'Please select a star rating.';
      return;
    }
    if (!this.ratingComment.trim()) {
      this.ratingError = 'Please write a comment.';
      return;
    }
    this.ratingSubmitting = true;
    this.ratingError = '';

    this.ratingService
      .submitRating(this.currentId, {
        rating: this.ratingValue,
        comment: this.ratingComment.trim(),
      })
      .subscribe({
        next: () => {
          this.ratingSubmitting = false;
          this.ratingSuccess = 'Thank you for your review!';
          this.resetRating();
          this.ratingSuccess = 'Thank you for your review!';
          this.loadReviews(this.currentId);
        },
        error: (err) => {
          this.ratingSubmitting = false;
          this.ratingError = err.error?.message ?? 'Could not submit review.';
        },
      });
  }

  // ── Edit review ────────────────────────────────────
  startEdit(review: IReview): void {
    this.editingReviewId = review._id;
    this.editRatingValue = review.rating;
    this.editComment = review.comment;
    this.editHoveredStar = 0;
    this.editError = '';
  }

  cancelEdit(): void {
    this.editingReviewId = null;
    this.editError = '';
  }

  setEditRating(star: number): void {
    this.editRatingValue = star;
  }
  hoverEditStar(star: number): void {
    this.editHoveredStar = star;
  }
  clearEditHover(): void {
    this.editHoveredStar = 0;
  }

  saveEdit(): void {
    if (!this.editRatingValue) {
      this.editError = 'Please select a rating.';
      return;
    }
    if (!this.editComment.trim()) {
      this.editError = 'Please write a comment.';
      return;
    }
    if (!this.editingReviewId) return;

    this.editSubmitting = true;
    this.editError = '';

    this.ratingService
      .updateRating(this.editingReviewId, {
        rating: this.editRatingValue,
        comment: this.editComment.trim(),
      })
      .subscribe({
        next: () => {
          this.editSubmitting = false;
          this.editingReviewId = null;
          this.loadReviews(this.currentId);
        },
        error: (err) => {
          this.editSubmitting = false;
          this.editError = err.error?.message ?? 'Could not update review.';
        },
      });
  }

  // ── Delete review ──────────────────────────────────
  confirmDelete(reviewId: string): void {
    this.deletingReviewId = reviewId;
  }
  cancelDelete(): void {
    this.deletingReviewId = null;
  }

  deleteReview(): void {
    if (!this.deletingReviewId) return;
    this.ratingService.deleteRating(this.deletingReviewId).subscribe({
      next: () => {
        this.deletingReviewId = null;
        this.loadReviews(this.currentId);
      },
      error: (err) => {
        this.deletingReviewId = null;
        console.error('Delete failed:', err);
      },
    });
  }

  // ── Cart / Navigation ──────────────────────────────
  addToCart(): void {
    if (this.product && this.product.quantity > 0) {
      this.cartService.addToCart(this.product);
      this.addedToCart = true;
    }
  }

  goBack(): void {
    this.location.back();
  }

  goNext(): void {
    this.currentIdIndex = this.idsArr.findIndex((id) => id === this.currentId);
    if (this.currentIdIndex !== -1 && this.currentIdIndex < this.idsArr.length - 1)
      this.router.navigateByUrl(`/Details/${this.idsArr[this.currentIdIndex + 1]}`);
  }

  goPrevious(): void {
    this.currentIdIndex = this.idsArr.findIndex((id) => id === this.currentId);
    if (this.currentIdIndex > 0)
      this.router.navigateByUrl(`/Details/${this.idsArr[this.currentIdIndex - 1]}`);
  }

  get isFirst(): boolean {
    return this.currentIdIndex <= 0;
  }
  get isLast(): boolean {
    return this.currentIdIndex >= this.idsArr.length - 1;
  }
  get cartCount(): number {
    return this.cartService.getCartCount();
  }
}
