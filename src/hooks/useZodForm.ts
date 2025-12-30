import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type UseFormProps } from "react-hook-form";
import * as z from "zod";

export const useZodForm = <T extends z.ZodTypeAny>(
    schema: T,
    options?: Omit<UseFormProps<z.infer<T> & import("react-hook-form").FieldValues>, "resolver">
) => {
    return useForm<z.infer<T> & import("react-hook-form").FieldValues>({
        resolver: zodResolver(schema as any) as any,
        ...options,
    });
};
