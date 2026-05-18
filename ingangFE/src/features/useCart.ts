import { useState, useEffect, useCallback } from 'react';
import { getCart, addToCart, removeFromCart } from '../shared/api/cart';
import type { CartItem } from '../shared/api/cart';

export const useCart = (userId: string | null) => {
    const [items, setItems] = useState<CartItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const loadCart = useCallback(async () => {
        if (!userId) { setItems([]); return; }
        setIsLoading(true);
        try {
            const cart = await getCart(userId);
            setItems(cart.items);
        } catch {
            setItems([]);
        } finally {
            setIsLoading(false);
        }
    }, [userId]);

    useEffect(() => { loadCart(); }, [loadCart]);

    const addItem = async (lectureId: number) => {
        if (!userId) return;
        const cart = await addToCart(userId, lectureId);
        setItems(cart.items);
    };

    const removeItem = async (lectureId: number) => {
        if (!userId) return;
        const cart = await removeFromCart(userId, lectureId);
        setItems(cart.items);
    };

    const isInCart = (lectureId: number) => items.some((item) => item.lectureId === lectureId);

    return { items, isLoading, addItem, removeItem, isInCart, refresh: loadCart };
};
