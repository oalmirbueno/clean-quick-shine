import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface CreateOrderInput {
  serviceId: string;
  addressId: string;
  scheduledDate: string; // YYYY-MM-DD
  scheduledTime: string; // HH:MM
  proId?: string | null;
  couponCode?: string | null;
  notes?: string;
}

export interface CreateOrderResult {
  orderId: string;
  pricing: {
    basePrice: number;
    durationHours: number;
    zoneFee: number;
    surgeMultiplier: number;
    discount: number;
    totalPrice: number;
  };
}

export function useCreateOrder() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateOrderInput): Promise<CreateOrderResult> => {
      if (!user?.id) throw new Error("Usuário não autenticado");

      // 1. Get service details
      const { data: service, error: serviceError } = await supabase
        .from("services")
        .select("id, base_price, duration_hours")
        .eq("id", input.serviceId)
        .single();

      if (serviceError || !service) {
        throw new Error("Serviço não encontrado");
      }

      // 2. Get address and zone info
      const { data: address, error: addressError } = await supabase
        .from("addresses")
        .select("id, zone_id")
        .eq("id", input.addressId)
        .eq("user_id", user.id)
        .single();

      if (addressError || !address) {
        throw new Error("Endereço não encontrado");
      }

      // 3. Get zone fee if applicable
      let zoneFee = 0;
      let surgeMultiplier = 1.0;

      if (address.zone_id) {
        const { data: zone } = await supabase
          .from("zones")
          .select("fee_extra")
          .eq("id", address.zone_id)
          .maybeSingle();

        zoneFee = Number(zone?.fee_extra || 0);

        const { data: zoneRule } = await supabase
          .from("zone_rules")
          .select("surge_multiplier")
          .eq("zone_id", address.zone_id)
          .eq("active", true)
          .maybeSingle();

        surgeMultiplier = Number(zoneRule?.surge_multiplier || 1.0);
      }

      // 4. Apply coupon if provided
      let discount = 0;
      let couponId: string | null = null;

      if (input.couponCode) {
        const { data: coupon } = await supabase
          .from("coupons")
          .select("*")
          .eq("code", input.couponCode.toUpperCase())
          .eq("active", true)
          .maybeSingle();

        if (coupon) {
          const minValue = Number(coupon.min_order_value || 0);
          if (Number(service.base_price) >= minValue) {
            if (coupon.discount_type === "percent") {
              discount = Number(service.base_price) * (Number(coupon.discount_value) / 100);
            } else {
              discount = Number(coupon.discount_value);
            }
            couponId = coupon.id;
          }
        }
      }

      // 5. Calculate total price
      const basePrice = Number(service.base_price);
      const subtotal = (basePrice + zoneFee) * surgeMultiplier;
      const totalPrice = Math.max(0, subtotal - discount);

      // 6. Create order
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          client_id: user.id,
          service_id: input.serviceId,
          address_id: input.addressId,
          scheduled_date: input.scheduledDate,
          scheduled_time: input.scheduledTime,
          pro_id: input.proId || null,
          base_price: basePrice,
          zone_fee: zoneFee,
          surge_multiplier: surgeMultiplier,
          discount: discount,
          total_price: totalPrice,
          duration_hours: Number(service.duration_hours),
          status: input.proId ? "confirmed" : "draft",
          notes: input.notes || null,
        })
        .select("id")
        .single();

      if (orderError || !order) {
        console.error("Order creation error:", orderError);
        throw new Error("Erro ao criar pedido");
      }

      // 7. Record coupon use if applied
      if (couponId && discount > 0) {
        await supabase.from("coupon_uses").insert({
          coupon_id: couponId,
          user_id: user.id,
          order_id: order.id,
        });

        const { data: currentCoupon } = await supabase
          .from("coupons")
          .select("uses_count")
          .eq("id", couponId)
          .single();

        if (currentCoupon) {
          await supabase
            .from("coupons")
            .update({ uses_count: (currentCoupon.uses_count || 0) + 1 })
            .eq("id", couponId);
        }
      }

      return {
        orderId: order.id,
        pricing: {
          basePrice,
          durationHours: Number(service.duration_hours),
          zoneFee,
          surgeMultiplier,
          discount,
          totalPrice,
        },
      };
    },
    onSuccess: () => {
      toast.success("Pedido criado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["client_orders"] });
    },
    onError: (error) => {
      console.error("Error creating order:", error);
      toast.error(error.message || "Erro ao criar pedido. Tente novamente.");
    },
  });
}

export function useValidateCoupon() {
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ code, orderValue }: { code: string; orderValue: number }) => {
      if (!user?.id) throw new Error("Usuário não autenticado");

      const { data: coupon, error } = await supabase
        .from("coupons")
        .select("*")
        .eq("code", code.toUpperCase())
        .eq("active", true)
        .maybeSingle();

      if (error || !coupon) {
        throw new Error("Cupom inválido ou expirado");
      }

      const now = new Date();
      if (coupon.valid_from && new Date(coupon.valid_from) > now) {
        throw new Error("Cupom ainda não está válido");
      }
      if (coupon.valid_until && new Date(coupon.valid_until) < now) {
        throw new Error("Cupom expirado");
      }

      if (coupon.max_uses && (coupon.uses_count || 0) >= coupon.max_uses) {
        throw new Error("Cupom esgotado");
      }

      const minValue = Number(coupon.min_order_value || 0);
      if (orderValue < minValue) {
        throw new Error(`Valor mínimo: R$ ${minValue.toFixed(2).replace(".", ",")}`);
      }

      const { data: existingUse } = await supabase
        .from("coupon_uses")
        .select("id")
        .eq("coupon_id", coupon.id)
        .eq("user_id", user.id)
        .maybeSingle();

      if (existingUse) {
        throw new Error("Você já utilizou este cupom");
      }

      let discount: number;
      if (coupon.discount_type === "percent") {
        discount = orderValue * (Number(coupon.discount_value) / 100);
      } else {
        discount = Number(coupon.discount_value);
      }

      return {
        code: coupon.code,
        discount: Math.min(discount, orderValue),
        description: coupon.description,
      };
    },
  });
}
