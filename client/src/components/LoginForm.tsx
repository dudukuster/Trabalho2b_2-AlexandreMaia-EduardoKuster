import {
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  Input,
} from "@chakra-ui/react";
import { Dispatch, SetStateAction } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "react-query";
import { loginUser, registerUser } from "../api";
import { decryptVault, generateVaultKey, hashPassword } from "../crypto";
import { VaultItem } from "../pages";
import FormWrapper from "./FormWrapper";

function LoginForm({
  setCofre,
  setChaveCofre,
  setEtapa,
}: {
  setCofre: Dispatch<SetStateAction<VaultItem[]>>;
  setChaveCofre: Dispatch<SetStateAction<string>>;
  setEtapa: Dispatch<SetStateAction<"login" | "register" | "vault">>;
}) {
  const {
    handleSubmit,
    register,
    getValues,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<{ email: string; password: string; hashedPassword: string }>();

  const mutacao = useMutation(loginUser, {
    onSuccess: ({ salt, vault }) => {
      const hashedPassword = getValues("hashedPassword");
      const email = getValues("email");

      const chaveCofre = generateVaultKey({
        hashedPassword,
        email,
        salt,
      });

      window.sessionStorage.setItem("vk", chaveCofre);

      const cofreDescriptografado = decryptVault({ vault, chaveCofre });

      setChaveCofre(chaveCofre);
      setCofre(cofreDescriptografado);

      window.sessionStorage.setItem("vault", JSON.stringify(cofreDescriptografado));

      setEtapa("vault");
    },
  });

  return (
    <FormWrapper
      onSubmit={handleSubmit(() => {
        const password = getValues("password");
        const email = getValues("email");

        const hashedPassword = hashPassword(password);

        setValue("hashedPassword", hashedPassword);

        mutacao.mutate({
          email,
          hashedPassword,
        });
      })}
    >
      <Heading>Login</Heading>

      <FormControl mt="4">
        <FormLabel htmlFor="email">Email</FormLabel>
        <Input
          id="email"
          placeholder="Email"
          {...register("email", {
            required: "Email é obrigatório",
            minLength: { value: 4, message: "Email deve ter no mínimo 4 caracteres" },
          })}
        />

        <FormErrorMessage>
          {errors.email && errors.email.message}
        </FormErrorMessage>
      </FormControl>
      <FormControl mt="4">
        <FormLabel htmlFor="password">Senha</FormLabel>
        <Input
          id="password"
          placeholder="Senha"
          type="password"
          {...register("password", {
            required: "Senha é obrigatória",
            minLength: {
              value: 6,
              message: "Senha deve ter no mínimo 6 caracteres",
            },
          })}
        />

        <FormErrorMessage>
          {errors.password && errors.password.message}
        </FormErrorMessage>
      </FormControl>

      <Button type="submit">Login</Button>
    </FormWrapper>
  );
}

export default LoginForm;
