import { Form } from '@inertiajs/react';
import { REGEXP_ONLY_DIGITS } from 'input-otp';
import { useMemo, useState } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from '@/components/ui/input-otp';
import { OTP_MAX_LENGTH } from '@/hooks/use-two-factor-auth';
import KasAuthLayout, {
    authErrorClass,
    authFieldClass,
    authMutedClass,
    authPrimaryButtonClass,
} from '@/layouts/auth/kas-auth-layout';
import { store } from '@/routes/two-factor/login';

export default function TwoFactorChallenge() {
    const [showRecoveryInput, setShowRecoveryInput] = useState<boolean>(false);
    const [code, setCode] = useState<string>('');

    const authConfigContent = useMemo<{
        title: string;
        description: string;
        toggleText: string;
    }>(() => {
        if (showRecoveryInput) {
            return {
                title: 'Kode pemulihan',
                description:
                    'Konfirmasi akses akun dengan memasukkan salah satu kode pemulihan darurat Anda.',
                toggleText: 'masuk dengan kode autentikasi',
            };
        }

        return {
            title: 'Kode autentikasi',
            description:
                'Masukkan kode autentikasi dari aplikasi authenticator Anda.',
            toggleText: 'masuk dengan kode pemulihan',
        };
    }, [showRecoveryInput]);

    const toggleRecoveryMode = (clearErrors: () => void): void => {
        setShowRecoveryInput(!showRecoveryInput);
        clearErrors();
        setCode('');
    };

    return (
        <KasAuthLayout
            head="Two-factor authentication"
            title={authConfigContent.title}
            description={authConfigContent.description}
        >
            <Form
                {...store.form()}
                className="flex flex-col gap-[14px]"
                resetOnError
                resetOnSuccess={!showRecoveryInput}
            >
                {({ errors, processing, clearErrors }) => (
                    <>
                        {showRecoveryInput ? (
                            <div className="flex flex-col gap-[6px]">
                                <Input
                                    name="recovery_code"
                                    type="text"
                                    placeholder="Masukkan kode pemulihan"
                                    autoFocus={showRecoveryInput}
                                    required
                                    className={authFieldClass}
                                />
                                <InputError
                                    message={errors.recovery_code}
                                    className={authErrorClass}
                                />
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center gap-[10px] text-center [&_[data-slot=input-otp-slot]]:border-[rgba(246,242,234,0.2)] [&_[data-slot=input-otp-slot]]:text-[#f6f2ea] lg:[&_[data-slot=input-otp-slot]]:border-[rgba(30,39,73,0.16)] lg:[&_[data-slot=input-otp-slot]]:bg-white lg:[&_[data-slot=input-otp-slot]]:text-[#1e2749]">
                                <InputOTP
                                    name="code"
                                    maxLength={OTP_MAX_LENGTH}
                                    value={code}
                                    onChange={(value) => setCode(value)}
                                    disabled={processing}
                                    pattern={REGEXP_ONLY_DIGITS}
                                    autoFocus
                                >
                                    <InputOTPGroup>
                                        {Array.from(
                                            { length: OTP_MAX_LENGTH },
                                            (_, index) => (
                                                <InputOTPSlot
                                                    key={index}
                                                    index={index}
                                                />
                                            ),
                                        )}
                                    </InputOTPGroup>
                                </InputOTP>
                                <InputError
                                    message={errors.code}
                                    className={authErrorClass}
                                />
                            </div>
                        )}

                        <Button
                            type="submit"
                            disabled={processing}
                            className={authPrimaryButtonClass}
                        >
                            Lanjutkan
                        </Button>

                        <p className={'m-0 text-center ' + authMutedClass}>
                            atau Anda bisa{' '}
                            <button
                                type="button"
                                className="cursor-pointer font-semibold text-[#f0b84e] underline-offset-4 hover:underline lg:text-[#2f7a68]"
                                onClick={() => toggleRecoveryMode(clearErrors)}
                            >
                                {authConfigContent.toggleText}
                            </button>
                        </p>
                    </>
                )}
            </Form>
        </KasAuthLayout>
    );
}
